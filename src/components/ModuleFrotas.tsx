import React, { useState, useContext, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Truck, Users, DollarSign, AlertTriangle, Calendar, FileText, Plus, Edit, Trash2, Search, X, 
  MapPin, CheckCircle, Clock, Info, Shield, RefreshCw, BarChart, Settings, Sliders, ArrowUpRight,
  TrendingUp, HelpCircle, Activity, Award, Phone, Mail, FileCheck, Check, Printer as PrinterIcon
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend, BarChart as RechartsBarChart, Bar
} from 'recharts';
import { collection, doc, addDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { ChurchContext } from '../App';

export interface Vehicle {
  id: string;
  marca: string;
  modelo: string;
  placa: string;
  ano: number;
  cor: string;
  tipo: 'Carro' | 'Van' | 'Ônibus' | 'Moto' | 'Utilitário' | 'Outro';
  renavam: string;
  chassi: string;
  data_licenciamento: string; // YYYY-MM-DD
  data_ipva: string; // YYYY-MM-DD
  status: 'Disponível' | 'Em Uso' | 'Em Manutenção' | 'Inativo';
  congregacao_id: string;
  documento_anexo?: string;
  documento_nome?: string;
}

export interface Driver {
  id: string;
  nome: string;
  cnh_numero: string;
  cnh_categoria: string; // A, B, C, D, E, AB etc.
  cnh_vencimento: string; // YYYY-MM-DD
  telefone: string;
  email: string;
  status: 'Ativo' | 'Suspenso' | 'Inativo';
  membro_id?: string; // opcional vínculo com membro do banco de dados
  congregacao_id: string;
  documento_anexo?: string;
  documento_nome?: string;
}

export interface Expense {
  id: string;
  veiculo_id: string;
  motorista_id?: string;
  data: string; // YYYY-MM-DD
  tipo: 'Combustível' | 'Manutenção Preventiva' | 'Manutenção Corretiva' | 'Seguro' | 'Lavagem' | 'Estacionamento' | 'Outros';
  valor: number;
  descricao: string;
  odometro?: number;
  comprovante?: string; // base64 ou URL
  congregacao_id: string;
}

export interface Fine {
  id: string;
  veiculo_id: string;
  motorista_id?: string;
  data_multa: string; // YYYY-MM-DD
  data_vencimento?: string; // YYYY-MM-DD
  infracao: string;
  pontos: number;
  valor: number;
  auto_infracao: string; // código da multa
  status: 'Paga' | 'Pendente' | 'Em Recurso' | 'Vencida';
  congregacao_id: string;
}

const ModuleFrotas = () => {
  const { db, addToast, dbFirestore, appId, user, setPrintMode, setPrintData, setPreviewOpen } = useContext(ChurchContext);
  
  const handlePrintReport = (subType: 'resumo' | 'veiculos' | 'despesas' | 'multas') => {
    setPrintData({
      subType,
      veiculos,
      motoristas,
      despesas,
      multas,
      igreja: db.igreja,
      congregacoes: db.congregacoes
    });
    setPrintMode('rel_frotas');
    setPreviewOpen(true);
  };

  // Tabs: 1: Painel Geral, 2: Veículos, 3: Motoristas, 4: Despesas, 5: Multas
  const [activeTab, setActiveTab] = useState<number>(1);
  const [congregacaoFilter, setCongregacaoFilter] = useState<string>('todas');

  // Search and status filters
  const [searchVeiculos, setSearchVeiculos] = useState('');
  const [filterStatusVeiculo, setFilterStatusVeiculo] = useState('todos');
  const [searchMotoristas, setSearchMotoristas] = useState('');
  const [filterTipoDespesa, setFilterTipoDespesa] = useState('todos');
  const [filterStatusMulta, setFilterStatusMulta] = useState('todos');

  // Modals visibility states
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [driverModalOpen, setDriverModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [fineModalOpen, setFineModalOpen] = useState(false);
  const [maintenanceModalOpen, setMaintenanceModalOpen] = useState(false);

  // Maintenance Log Modal status & forms
  const [selectedVehicleForMaintenance, setSelectedVehicleForMaintenance] = useState<Vehicle | null>(null);
  const [mDate, setMDate] = useState(new Date().toISOString().split('T')[0]);
  const [mType, setMType] = useState<'Manutenção Preventiva' | 'Manutenção Corretiva'>('Manutenção Preventiva');
  const [mValue, setMValue] = useState('');
  const [mDescription, setMDescription] = useState('');
  const [mOdometer, setMOdometer] = useState('');

  // Editing Items
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingFine, setEditingFine] = useState<Fine | null>(null);

  // Form Fields - Vehicle
  const [vMarca, setVMarca] = useState('');
  const [vModelo, setVModelo] = useState('');
  const [vPlaca, setVPlaca] = useState('');
  const [vAno, setVAno] = useState(new Date().getFullYear());
  const [vCor, setVCor] = useState('');
  const [vTipo, setVTipo] = useState<'Carro' | 'Van' | 'Ônibus' | 'Moto' | 'Utilitário' | 'Outro'>('Carro');
  const [vRenavam, setVRenavam] = useState('');
  const [vChassi, setVChassi] = useState('');
  const [vDataLicenciamento, setVDataLicenciamento] = useState('');
  const [vDataIpva, setVDataIpva] = useState('');
  const [vStatus, setVStatus] = useState<'Disponível' | 'Em Uso' | 'Em Manutenção' | 'Inativo'>('Disponível');
  const [vDocumentoAnexo, setVDocumentoAnexo] = useState<string>('');
  const [vDocumentoNome, setVDocumentoNome] = useState<string>('');

  // Form Fields - Driver
  const [dNome, setDNome] = useState('');
  const [dCnhNumero, setDCnhNumero] = useState('');
  const [dCnhCategoria, setDCnhCategoria] = useState('B');
  const [dCnhVencimento, setDCnhVencimento] = useState('');
  const [dTelefone, setDTelefone] = useState('');
  const [dEmail, setDEmail] = useState('');
  const [dStatus, setDStatus] = useState<'Ativo' | 'Suspenso' | 'Inativo'>('Ativo');
  const [dMembroId, setDMembroId] = useState('');
  const [dDocumentoAnexo, setDDocumentoAnexo] = useState<string>('');
  const [dDocumentoNome, setDDocumentoNome] = useState<string>('');

  // Form Fields - Expense
  const [eVeiculoId, setEVeiculoId] = useState('');
  const [eMotoristaId, setEMoristaId] = useState('');
  const [eData, setEData] = useState(new Date().toISOString().split('T')[0]);
  const [eTipo, setETipo] = useState<'Combustível' | 'Manutenção Preventiva' | 'Manutenção Corretiva' | 'Seguro' | 'Lavagem' | 'Estacionamento' | 'Outros'>('Combustível');
  const [eValor, setEValor] = useState('');
  const [eDescricao, setEDescricao] = useState('');
  const [eOdometro, setEOdometro] = useState('');

  // Form Fields - Fine
  const [fVeiculoId, setFVeiculoId] = useState('');
  const [fMotoristaId, setFMoristaId] = useState('');
  const [fDataMulta, setFDataMulta] = useState(new Date().toISOString().split('T')[0]);
  const [fDataVencimento, setFDataVencimento] = useState('');
  const [fInfracao, setFInfracao] = useState('');
  const [fPontos, setFPontos] = useState('');
  const [fValor, setFValor] = useState('');
  const [fAutoInfracao, setFAutoInfracao] = useState('');
  const [fStatus, setFStatus] = useState<'Paga' | 'Pendente' | 'Em Recurso' | 'Vencida'>('Pendente');

  // Retrieve records from context db (with safe fallbacks)
  const veiculos: Vehicle[] = useMemo(() => {
    const raw = db.frotas_veiculos || [];
    return raw.filter((v: any) => 
      !v.deleted && 
      (congregacaoFilter === 'todas' || v.congregacao_id === congregacaoFilter)
    );
  }, [db.frotas_veiculos, congregacaoFilter]);

  const motoristas: Driver[] = useMemo(() => {
    const raw = db.frotas_motoristas || [];
    return raw.filter((d: any) => 
      !d.deleted && 
      (congregacaoFilter === 'todas' || d.congregacao_id === congregacaoFilter)
    );
  }, [db.frotas_motoristas, congregacaoFilter]);

  const despesas: Expense[] = useMemo(() => {
    const raw = db.frotas_despesas || [];
    return raw.filter((e: any) => 
      !e.deleted && 
      (congregacaoFilter === 'todas' || e.congregacao_id === congregacaoFilter)
    );
  }, [db.frotas_despesas, congregacaoFilter]);

  const multas: Fine[] = useMemo(() => {
    const raw = db.frotas_multas || [];
    return raw.filter((f: any) => 
      !f.deleted && 
      (congregacaoFilter === 'todas' || f.congregacao_id === congregacaoFilter)
    );
  }, [db.frotas_multas, congregacaoFilter]);

  // Vínculos listagem congregacao para campos
  const activeBranch = user?.congregacao_id || 'sede';

  // DOCUMENTATION ANALYSIS SCRIPT
  const docStatus = (dateStr: string) => {
    if (!dateStr) return { label: 'Sem data', status: 'error', color: 'text-rose-600 bg-rose-50 border-rose-200' };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(dateStr + 'T00:00:00');
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: `Vencido há ${Math.abs(diffDays)} dias`, status: 'vencido', color: 'text-rose-600 bg-rose-50 border-rose-200' };
    } else if (diffDays <= 30) {
      return { label: `Vence em ${diffDays} dias`, status: 'alerta', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    }
    return { label: 'Regular (Em Dia)', status: 'regular', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
  };

  // ----------------------------------------------------
  // --- DATABASE HELPERS ---
  // ----------------------------------------------------
  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vMarca || !vModelo || !vPlaca) {
      addToast('Preencha os campos obrigatórios (Marca, Modelo, Placa).', 'warning');
      return;
    }

    const payload = {
      marca: vMarca,
      modelo: vModelo,
      placa: vPlaca.toUpperCase().replace(/[^A-Z0-9-]/g, ''),
      ano: Number(vAno),
      cor: vCor,
      tipo: vTipo,
      renavam: vRenavam,
      chassi: vChassi,
      data_licenciamento: vDataLicenciamento,
      data_ipva: vDataIpva,
      status: vStatus,
      documento_anexo: vDocumentoAnexo || null,
      documento_nome: vDocumentoNome || null,
      congregacao_id: editingVehicle ? editingVehicle.congregacao_id : activeBranch,
    };

    try {
      if (editingVehicle) {
        const docRef = doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'frotas_veiculos', editingVehicle.id);
        await setDoc(docRef, payload, { merge: true });
        addToast('Veículo atualizado com sucesso!', 'success');
      } else {
        const colRef = collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'frotas_veiculos');
        await addDoc(colRef, { ...payload, created_at: new Date().toISOString() });
        addToast('Veículo cadastrado com sucesso!', 'success');
      }
      setVehicleModalOpen(false);
      resetVehicleForm();
    } catch (err: any) {
      addToast(`Erro ao salvar veículo: ${err.message}`, 'error');
    }
  };

  const resetVehicleForm = () => {
    setEditingVehicle(null);
    setVMarca('');
    setVModelo('');
    setVPlaca('');
    setVAno(new Date().getFullYear());
    setVCor('');
    setVTipo('Carro');
    setVRenavam('');
    setVChassi('');
    setVDataLicenciamento('');
    setVDataIpva('');
    setVStatus('Disponível');
    setVDocumentoAnexo('');
    setVDocumentoNome('');
  };

  const handleEditVehicle = (veh: Vehicle) => {
    setEditingVehicle(veh);
    setVMarca(veh.marca || '');
    setVModelo(veh.modelo || '');
    setVPlaca(veh.placa || '');
    setVAno(veh.ano || new Date().getFullYear());
    setVCor(veh.cor || '');
    setVTipo(veh.tipo || 'Carro');
    setVRenavam(veh.renavam || '');
    setVChassi(veh.chassi || '');
    setVDataLicenciamento(veh.data_licenciamento || '');
    setVDataIpva(veh.data_ipva || '');
    setVStatus(veh.status || 'Disponível');
    setVDocumentoAnexo(veh.documento_anexo || '');
    setVDocumentoNome(veh.documento_nome || '');
    setVehicleModalOpen(true);
  };

  const handleDeleteVehicle = async (id: string) => {
    if (!window.confirm('Deseja realmente remover este veículo?')) return;
    try {
      const docRef = doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'frotas_veiculos', id);
      await setDoc(docRef, { deleted: true }, { merge: true });
      addToast('Veículo movido para a lixeira.', 'success');
    } catch (err: any) {
      addToast(`Erro ao excluir: ${err.message}`, 'error');
    }
  };

  // Motoristas Functions
  const handleSaveDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dNome || !dCnhNumero) {
      addToast('Preencha os campos obrigatórios (Nome, CNH).', 'warning');
      return;
    }

    const payload = {
      nome: dNome,
      cnh_numero: dCnhNumero,
      cnh_categoria: dCnhCategoria,
      cnh_vencimento: dCnhVencimento,
      telefone: dTelefone,
      email: dEmail,
      status: dStatus,
      membro_id: dMembroId || null,
      documento_anexo: dDocumentoAnexo || null,
      documento_nome: dDocumentoNome || null,
      congregacao_id: editingDriver ? editingDriver.congregacao_id : activeBranch,
    };

    try {
      if (editingDriver) {
        const docRef = doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'frotas_motoristas', editingDriver.id);
        await setDoc(docRef, payload, { merge: true });
        addToast('Motorista atualizado com sucesso!', 'success');
      } else {
        const colRef = collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'frotas_motoristas');
        await addDoc(colRef, { ...payload, created_at: new Date().toISOString() });
        addToast('Motorista cadastrado com sucesso!', 'success');
      }
      setDriverModalOpen(false);
      resetDriverForm();
    } catch (err: any) {
      addToast(`Erro ao salvar motorista: ${err.message}`, 'error');
    }
  };

  const resetDriverForm = () => {
    setEditingDriver(null);
    setDNome('');
    setDCnhNumero('');
    setDCnhCategoria('B');
    setDCnhVencimento('');
    setDTelefone('');
    setDEmail('');
    setDStatus('Ativo');
    setDMembroId('');
    setDDocumentoAnexo('');
    setDDocumentoNome('');
  };

  const handleEditDriver = (dri: Driver) => {
    setEditingDriver(dri);
    setDNome(dri.nome || '');
    setDCnhNumero(dri.cnh_numero || '');
    setDCnhCategoria(dri.cnh_categoria || 'B');
    setDCnhVencimento(dri.cnh_vencimento || '');
    setDTelefone(dri.telefone || '');
    setDEmail(dri.email || '');
    setDStatus(dri.status || 'Ativo');
    setDMembroId(dri.membro_id || '');
    setDDocumentoAnexo(dri.documento_anexo || '');
    setDDocumentoNome(dri.documento_nome || '');
    setDriverModalOpen(true);
  };

  const handleDeleteDriver = async (id: string) => {
    if (!window.confirm('Deseja realmente remover este motorista?')) return;
    try {
      const docRef = doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'frotas_motoristas', id);
      await setDoc(docRef, { deleted: true }, { merge: true });
      addToast('Motorista removido.', 'success');
    } catch (err: any) {
      addToast(`Erro ao excluir: ${err.message}`, 'error');
    }
  };

  // Expenses functions
  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eVeiculoId || !eValor || !eData) {
      addToast('Selecione o veículo, insira o valor e a data.', 'warning');
      return;
    }

    const numericValue = Number(eValor);
    const vehicle = veiculos.find(v => v.id === eVeiculoId);
    const driver = motoristas.find(m => m.id === eMotoristaId);
    const targetBranch = editingExpense ? editingExpense.congregacao_id : activeBranch;
    
    const descPersonalizada = `[FROTA: ${vehicle ? `${vehicle.modelo} - ${vehicle.placa}` : 'VEÍCULO'}] ${eDescricao || ''}${driver ? ` | Condutor: ${driver.nome}` : ''}`.toUpperCase();

    try {
      if (editingExpense) {
        // 1. If we are editing, update the corresponding frotas_despesas entry
        const expenseDocRef = doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'frotas_despesas', editingExpense.id);
        
        let finId = (editingExpense as any).financeiro_id || null;
        if (finId) {
          // Update corresponding financeiro saida
          const finDocRef = doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'financeiro', finId);
          await setDoc(finDocRef, {
            valor: numericValue,
            descricao: descPersonalizada,
            data_competencia: eData,
            data_vencimento: eData,
            congregacao_id: targetBranch
          }, { merge: true });
        } else {
          // If for some reason there is no linked financeiro entry, create one!
          const finColRef = collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'financeiro');
          const finDocRef = await addDoc(finColRef, {
            tipo: 'saida',
            valor: numericValue,
            categoria: 'Veículos / Frotas',
            descricao: descPersonalizada,
            data_competencia: eData,
            data_vencimento: eData,
            forma_pagamento: 'OUTROS',
            status: 'pago',
            conciliado: false,
            congregacao_id: targetBranch,
            created_at: new Date().toISOString()
          });
          finId = finDocRef.id;
        }

        const payload = {
          veiculo_id: eVeiculoId,
          motorista_id: eMotoristaId || null,
          data: eData,
          tipo: eTipo,
          valor: numericValue,
          descricao: eDescricao,
          odometro: eOdometro ? Number(eOdometro) : null,
          congregacao_id: targetBranch,
          financeiro_id: finId
        };
        await setDoc(expenseDocRef, payload, { merge: true });
        addToast('Lançamento de despesa e financeiro atualizados!', 'success');
      } else {
        // 2. If we are creating new: First, write to financeiro collection
        const finColRef = collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'financeiro');
        const finDocRef = await addDoc(finColRef, {
          tipo: 'saida',
          valor: numericValue,
          categoria: 'Veículos / Frotas',
          descricao: descPersonalizada,
          data_competencia: eData,
          data_vencimento: eData,
          forma_pagamento: 'OUTROS',
          status: 'pago',
          conciliado: false,
          congregacao_id: targetBranch,
          created_at: new Date().toISOString()
        });

        // Secondly, write to frotas_despesas with financeiro_id
        const payload = {
          veiculo_id: eVeiculoId,
          motorista_id: eMotoristaId || null,
          data: eData,
          tipo: eTipo,
          valor: numericValue,
          descricao: eDescricao,
          odometro: eOdometro ? Number(eOdometro) : null,
          congregacao_id: targetBranch,
          financeiro_id: finDocRef.id
        };
        const colRef = collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'frotas_despesas');
        await addDoc(colRef, { ...payload, created_at: new Date().toISOString() });
        addToast('Gasto salvo e despesa enviada ao módulo de despesas do sistema!', 'success');
      }
      setExpenseModalOpen(false);
      resetExpenseForm();
    } catch (err: any) {
      addToast(`Erro ao salvar no sistema de despesas: ${err.message}`, 'error');
    }
  };

  const resetExpenseForm = () => {
    setEditingExpense(null);
    setEVeiculoId('');
    setEMoristaId('');
    setEData(new Date().toISOString().split('T')[0]);
    setETipo('Combustível');
    setEValor('');
    setEDescricao('');
    setEOdometro('');
  };

  const handleEditExpense = (exp: Expense) => {
    setEditingExpense(exp);
    setEVeiculoId(exp.veiculo_id || '');
    setEMoristaId(exp.motorista_id || '');
    setEData(exp.data || new Date().toISOString().split('T')[0]);
    setETipo(exp.tipo || 'Combustível');
    setEValor(String(exp.valor) || '');
    setEDescricao(exp.descricao || '');
    setEOdometro(exp.odometro ? String(exp.odometro) : '');
    setExpenseModalOpen(true);
  };

  const handleDeleteExpense = async (id: string) => {
    if (!window.confirm('Deseja excluir este registro de despesa? (Removerá também do Financeiro)')) return;
    try {
      const rawExp = despesas.find((e: any) => e.id === id);
      if (rawExp && (rawExp as any).financeiro_id) {
        // Soft-delete linked financeiro entry
        const finDocRef = doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'financeiro', (rawExp as any).financeiro_id);
        await setDoc(finDocRef, { deleted: true }, { merge: true });
      }
      const docRef = doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'frotas_despesas', id);
      await setDoc(docRef, { deleted: true }, { merge: true });
      addToast('Lançamento e despesa do financeiro excluídos com sucesso.', 'success');
    } catch (err: any) {
      addToast(`Erro ao excluir: ${err.message}`, 'error');
    }
  };

  const handleSaveMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicleForMaintenance) return;
    if (!mValue || !mDescription) {
      addToast('Preencha os campos obrigatórios (Custo e Descrição do Serviço).', 'warning');
      return;
    }

    const payload = {
      veiculo_id: selectedVehicleForMaintenance.id,
      data: mDate,
      tipo: mType,
      valor: Number(mValue),
      descricao: mDescription,
      odometro: mOdometer ? Number(mOdometer) : null,
      congregacao_id: selectedVehicleForMaintenance.congregacao_id,
    };

    try {
      const colRef = collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'frotas_despesas');
      await addDoc(colRef, { ...payload, created_at: new Date().toISOString() });
      addToast('Manutenção registrada com sucesso!', 'success');
      setMValue('');
      setMDescription('');
      setMOdometer('');
    } catch (err: any) {
      addToast(`Erro ao salvar manutenção: ${err.message}`, 'error');
    }
  };

  // Fines functions
  const handleSaveFine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fVeiculoId || !fValor || !fInfracao) {
      addToast('Preencha veículo, infração e valor.', 'warning');
      return;
    }

    const payload = {
      veiculo_id: fVeiculoId,
      motorista_id: fMotoristaId || null,
      data_multa: fDataMulta,
      data_vencimento: fDataVencimento || null,
      infracao: fInfracao,
      pontos: fPontos ? Number(fPontos) : 0,
      valor: Number(fValor),
      auto_infracao: fAutoInfracao,
      status: fStatus,
      congregacao_id: editingFine ? editingFine.congregacao_id : activeBranch,
    };

    try {
      if (editingFine) {
        const docRef = doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'frotas_multas', editingFine.id);
        await setDoc(docRef, payload, { merge: true });
        addToast('Lançamento de multa atualizado!', 'success');
      } else {
        const colRef = collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'frotas_multas');
        await addDoc(colRef, { ...payload, created_at: new Date().toISOString() });
        addToast('Multa registrada com sucesso!', 'success');
      }
      setFineModalOpen(false);
      resetFineForm();
    } catch (err: any) {
      addToast(`Erro ao salvar multa: ${err.message}`, 'error');
    }
  };

  const resetFineForm = () => {
    setEditingFine(null);
    setFVeiculoId('');
    setFMoristaId('');
    setFDataMulta(new Date().toISOString().split('T')[0]);
    setFDataVencimento('');
    setFInfracao('');
    setFPontos('');
    setFValor('');
    setFAutoInfracao('');
    setFStatus('Pendente');
  };

  const handleEditFine = (fin: Fine) => {
    setEditingFine(fin);
    setFVeiculoId(fin.veiculo_id || '');
    setFMoristaId(fin.motorista_id || '');
    setFDataMulta(fin.data_multa || new Date().toISOString().split('T')[0]);
    setFDataVencimento(fin.data_vencimento || '');
    setFInfracao(fin.infracao || '');
    setFPontos(fin.pontos ? String(fin.pontos) : '');
    setFValor(String(fin.valor) || '');
    setFAutoInfracao(fin.auto_infracao || '');
    setFStatus(fin.status || 'Pendente');
    setFineModalOpen(true);
  };

  const handleDeleteFine = async (id: string) => {
    if (!window.confirm('Excluir este lançamento de multa?')) return;
    try {
      const docRef = doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'frotas_multas', id);
      await setDoc(docRef, { deleted: true }, { merge: true });
      addToast('Multa excluída de forma lógica.', 'success');
    } catch (err: any) {
      addToast(`Erro ao remover multa: ${err.message}`, 'error');
    }
  };

  // ----------------------------------------------------
  // --- STATS CALCULATION ---
  // ----------------------------------------------------
  const stats = useMemo(() => {
    const totalV = veiculos.length;
    const activeD = motoristas.filter(m => m.status === 'Ativo').length;
    
    // Total expenses
    const totalExp = despesas.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);
    
    // Pending fine value
    const pendingFines = multas.filter(f => f.status === 'Pendente');
    const totalFinesValue = pendingFines.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);
    const countFines = pendingFines.length;

    // Filter documentation alerts
    let docAlertsCount = 0;
    veiculos.forEach(v => {
      if (docStatus(v.data_licenciamento).status !== 'regular') docAlertsCount++;
      if (docStatus(v.data_ipva).status !== 'regular') docAlertsCount++;
    });
    motoristas.forEach(d => {
      if (docStatus(d.cnh_vencimento).status !== 'regular') docAlertsCount++;
    });

    return {
      totalV,
      activeD,
      totalExp,
      totalFinesValue,
      countFines,
      docAlertsCount
    };
  }, [veiculos, motoristas, despesas, multas]);

  // CHARTS MODEL PREPARATION
  const expensesByTypeChart = useMemo(() => {
    const categories: Record<string, number> = {};
    despesas.forEach(d => {
      const cat = d.tipo || 'Outros';
      categories[cat] = (categories[cat] || 0) + Number(d.valor);
    });

    const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#6b7280'];
    return Object.keys(categories).map((name, i) => ({
      name,
      value: categories[name],
      color: colors[i % colors.length]
    }));
  }, [despesas]);

  const expensesByVehicleChart = useMemo(() => {
    const vehiclesExp: Record<string, number> = {};
    despesas.forEach(d => {
      const veh = veiculos.find(v => v.id === d.veiculo_id);
      const name = veh ? `${veh.modelo} (${veh.placa})` : 'Outros';
      vehiclesExp[name] = (vehiclesExp[name] || 0) + Number(d.valor);
    });

    return Object.keys(vehiclesExp).map(name => ({
      name,
      Valor: vehiclesExp[name]
    })).slice(0, 5); // top 5
  }, [despesas, veiculos]);

  const fuelChartData = useMemo(() => {
    const fuelExps = despesas.filter(d => d.tipo === 'Combustível');
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    const monthlyMap: Record<string, Record<string, number>> = {};
    const monthsOrder: string[] = [];

    const sortedFuelExps = [...fuelExps].sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

    sortedFuelExps.forEach(d => {
      if (!d.data) return;
      const date = new Date(d.data + 'T00:00:00');
      if (isNaN(date.getTime())) return;
      
      const monthName = months[date.getMonth()];
      const year = date.getFullYear();
      const key = `${monthName}/${year}`;
      
      if (!monthlyMap[key]) {
        monthlyMap[key] = {};
        monthsOrder.push(key);
      }
      
      const veh = veiculos.find(v => v.id === d.veiculo_id);
      const label = veh ? `${veh.modelo} (${veh.placa})` : 'Desvinculado';
      
      monthlyMap[key][label] = (monthlyMap[key][label] || 0) + Number(d.valor);
    });

    const last6Keys = monthsOrder.slice(-6);

    return last6Keys.map(key => ({
      month: key,
      ...monthlyMap[key]
    }));
  }, [despesas, veiculos]);

  const uniqueFuelVehicles = useMemo(() => {
    const fuelExps = despesas.filter(d => d.tipo === 'Combustível');
    const setOfVehicles = new Set<string>();
    
    fuelExps.forEach(d => {
      const veh = veiculos.find(v => v.id === d.veiculo_id);
      const label = veh ? `${veh.modelo} (${veh.placa})` : 'Desvinculado';
      setOfVehicles.add(label);
    });
    
    return Array.from(setOfVehicles);
  }, [despesas, veiculos]);

  // Filters results
  const filteredVeiculos = useMemo(() => {
    return veiculos.filter(v => {
      const matchesSearch = `${v.marca} ${v.modelo} ${v.placa}`.toLowerCase().includes(searchVeiculos.toLowerCase());
      const matchesStatus = filterStatusVeiculo === 'todos' || v.status === filterStatusVeiculo;
      return matchesSearch && matchesStatus;
    });
  }, [veiculos, searchVeiculos, filterStatusVeiculo]);

  const filteredMotoristas = useMemo(() => {
    return motoristas.filter(m => {
      return m.nome.toLowerCase().includes(searchMotoristas.toLowerCase());
    });
  }, [motoristas, searchMotoristas]);

  const filteredDespesas = useMemo(() => {
    return despesas.filter(d => {
      const matchesType = filterTipoDespesa === 'todos' || d.tipo === filterTipoDespesa;
      return matchesType;
    });
  }, [despesas, filterTipoDespesa]);

  const filteredMultas = useMemo(() => {
    return multas.filter(f => {
      return filterStatusMulta === 'todos' || f.status === filterStatusMulta;
    });
  }, [multas, filterStatusMulta]);

  return (
    <div className="h-full flex flex-col space-y-6 animate-entrance text-slate-800 font-sans">
      
      {/* HEADER DE MÓDULO */}
      <div className="flex justify-between items-center bg-white/40 p-4 rounded-2xl border border-white/50 shadow-sm flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shadow-sm border border-blue-100">
            <Truck size={28}/>
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Gestão de Frotas & Veículos</h2>
            <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-wider">Controle de veículos, motoristas, combustíveis, revisões e multas</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2.5">
          <select 
            value={congregacaoFilter} 
            onChange={e => setCongregacaoFilter(e.target.value)} 
            className="bg-white p-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none shadow-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="todas">Filtro: Todas as Congregações</option>
            <option value="sede">Sede Principal</option>
            {(db.congregacoes || []).map((c: any) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>

          {/* Botões de Relatório no padrão do sistema */}
          <button
            onClick={() => handlePrintReport('resumo')}
            className="flex items-center gap-2 px-3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black rounded-xl shadow-sm cursor-pointer transition-all uppercase tracking-wider"
            title="Visualizar/Imprimir Relatório de Frotas Geral"
          >
            <PrinterIcon size={14} /> Relatório Geral
          </button>

          <button
            onClick={() => handlePrintReport('despesas')}
            className="flex items-center gap-2 px-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black rounded-xl shadow-sm cursor-pointer transition-all uppercase tracking-wider"
            title="Visualizar/Imprimir Relatório de Despesas"
          >
            <PrinterIcon size={14} /> Despesas
          </button>

          <button
            onClick={() => handlePrintReport('multas')}
            className="flex items-center gap-2 px-3 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-black rounded-xl shadow-sm cursor-pointer transition-all uppercase tracking-wider"
            title="Visualizar/Imprimir Relatório de Multas"
          >
            <PrinterIcon size={14} /> Multas
          </button>
        </div>
      </div>

      {/* MÉTRICAS E KIPs PRINCIPAIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Veículos</span>
            <h3 className="text-3xl font-black text-slate-850">{stats.totalV}</h3>
            <span className="text-[9px] text-slate-400 font-bold">Atalhos para cadastro</span>
          </div>
          <span className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <Truck size={20} />
          </span>
        </div>

        <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Motoristas</span>
            <h3 className="text-3xl font-black text-slate-850">{stats.activeD}</h3>
            <span className="text-[9px] text-emerald-500 font-bold flex items-center gap-0.5">● Habilitados</span>
          </div>
          <span className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Users size={20} />
          </span>
        </div>

        <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Gastos Totais</span>
            <h3 className="text-2xl font-black text-emerald-600">R$ {stats.totalExp.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
            <span className="text-[9px] text-slate-400 font-bold">Consumos registados</span>
          </div>
          <span className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <DollarSign size={20} />
          </span>
        </div>

        <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Multas Pendentes</span>
            <h3 className="text-3xl font-black text-rose-600">{stats.countFines}</h3>
            <span className="text-[9px] text-rose-500 font-semibold">Total: R$ {stats.totalFinesValue.toFixed(2)}</span>
          </div>
          <span className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
            <AlertTriangle size={20} />
          </span>
        </div>

        <div className={`p-5 rounded-[2rem] border shadow-sm flex items-center justify-between transition-colors ${
          stats.docAlertsCount > 0 ? 'bg-amber-50/70 border-amber-200 text-amber-900' : 'bg-white border-slate-100'
        }`}>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest block mb-0.5 opacity-70">Exigências Doc</span>
            <h3 className="text-3xl font-black">{stats.docAlertsCount} pendências</h3>
            <span className="text-[9px] font-bold opacity-80">Licenciamento / CNH / IPVA</span>
          </div>
          <span className={`p-3 rounded-2xl ${stats.docAlertsCount > 0 ? 'bg-amber-100/80 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
            <Calendar size={20} />
          </span>
        </div>
      </div>

      {/* SELECÇÃO DE ABAS */}
      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => setActiveTab(1)} 
          className={`px-5 py-3.5 font-bold uppercase tracking-wider text-xs border-b-2 transition-all ${
            activeTab === 1 ? 'border-blue-600 text-blue-600 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Painel Geral
        </button>
        <button 
          onClick={() => setActiveTab(2)} 
          className={`px-5 py-3.5 font-bold uppercase tracking-wider text-xs border-b-2 transition-all ${
            activeTab === 2 ? 'border-blue-600 text-blue-600 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Frota / Veículos ({veiculos.length})
        </button>
        <button 
          onClick={() => setActiveTab(3)} 
          className={`px-5 py-3.5 font-bold uppercase tracking-wider text-xs border-b-2 transition-all ${
            activeTab === 3 ? 'border-blue-600 text-blue-600 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Motoristas ({motoristas.length})
        </button>
        <button 
          onClick={() => setActiveTab(4)} 
          className={`px-5 py-3.5 font-bold uppercase tracking-wider text-xs border-b-2 transition-all ${
            activeTab === 4 ? 'border-blue-600 text-blue-600 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Gastos & Despesas
        </button>
        <button 
          onClick={() => setActiveTab(5)} 
          className={`px-5 py-3.5 font-bold uppercase tracking-wider text-xs border-b-2 transition-all ${
            activeTab === 5 ? 'border-blue-600 text-blue-600 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Controle de Multas
        </button>
      </div>

      {/* CONTEÚDO DAS ABAS */}
      <div className="flex-1">
        
        {/* === ABA 1: PAINEL GERAL (RESUMOS E ALERTAS) === */}
        {activeTab === 1 && (
          <div className="space-y-6 animate-fadeIn">
            {/* ALERTAS CRÍTICOS DE COMPLIANCE */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h4 className="font-extrabold text-slate-800 text-sm mb-4 flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-500"/> Alertas de Vencimento de Documentos
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Situação da Frota (Licenciamento e IPVA)</h5>
                  {veiculos.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">Nenhum veículo cadastrado para verificação.</p>
                  ) : (
                    <div className="max-h-[220px] overflow-y-auto space-y-1.5 pr-2 custom-scrollbar">
                      {veiculos.flatMap(v => {
                        const licStatus = docStatus(v.data_licenciamento);
                        const ipvaStatus = docStatus(v.data_ipva);
                        const alerts = [];
                        if (licStatus.status !== 'regular') {
                          alerts.push({ name: `${v.modelo} - Licenciamento`, info: licStatus.label, color: licStatus.color });
                        }
                        if (ipvaStatus.status !== 'regular') {
                          alerts.push({ name: `${v.modelo} - IPVA`, info: ipvaStatus.label, color: ipvaStatus.color });
                        }
                        return alerts;
                      }).length === 0 ? (
                        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
                          <CheckCircle size={14}/> Toda a documentação da frota está rigorosamente em dia!
                        </div>
                      ) : (
                        veiculos.flatMap(v => {
                          const licStatus = docStatus(v.data_licenciamento);
                          const ipvaStatus = docStatus(v.data_ipva);
                          const alerts = [];
                          if (licStatus.status !== 'regular') {
                            alerts.push({ id: v.id + '_lic', plate: v.placa, name: `${v.modelo} - Outorga de Licenciamento`, info: licStatus.label, color: licStatus.color });
                          }
                          if (ipvaStatus.status !== 'regular') {
                            alerts.push({ id: v.id + '_ipva', plate: v.placa, name: `${v.modelo} - Pagamento IPVA`, info: ipvaStatus.label, color: ipvaStatus.color });
                          }
                          return alerts;
                        }).map(alert => (
                          <div key={alert.id} className={`p-2.5 rounded-xl border flex justify-between items-center text-xs ${alert.color}`}>
                            <div>
                              <span className="font-extrabold">{alert.name}</span>
                              <p className="text-[10px] font-mono opacity-80 mt-0.5">Placa: {alert.plate}</p>
                            </div>
                            <span className="font-semibold text-[10px] tracking-wide uppercase px-2 py-0.5 rounded bg-white/60">{alert.info}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Situação dos Motoristas (CNH e Habilitações)</h5>
                  {motoristas.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">Nenhum motorista com CNH registrada.</p>
                  ) : (
                    <div className="max-h-[220px] overflow-y-auto space-y-1.5 pr-2 custom-scrollbar">
                      {motoristas.filter(m => docStatus(m.cnh_vencimento).status !== 'regular').length === 0 ? (
                        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
                          <CheckCircle size={14}/> Todas as CNHs dos motoristas estão válidas e seguras!
                        </div>
                      ) : (
                        motoristas.filter(m => docStatus(m.cnh_vencimento).status !== 'regular').map(m => {
                          const cnhStatus = docStatus(m.cnh_vencimento);
                          return (
                            <div key={m.id} className={`p-2.5 rounded-xl border flex justify-between items-center text-xs ${cnhStatus.color}`}>
                              <div>
                                <span className="font-extrabold">{m.nome} (CNH)</span>
                                <p className="text-[10px] opacity-80 mt-0.5">Nº Registro: {m.cnh_numero} • Categoria {m.cnh_categoria}</p>
                              </div>
                              <span className="font-semibold text-[10px] tracking-wide uppercase px-2 py-0.5 rounded bg-white/60">{cnhStatus.label}</span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* GRÁFICOS E MÉTRICAS DE GASTOS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Despesas por Categoria */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between h-[360px]">
                <div>
                  <h4 className="font-extrabold text-slate-800 text-sm mb-1">Distribuição de Gastos com Frota</h4>
                  <p className="text-xs text-slate-400">Total investido nos veículos agrupado pelas principais rubricas</p>
                </div>
                
                <div className="flex-1 flex gap-4 items-center">
                  {expensesByTypeChart.length === 0 ? (
                    <div className="flex-1 text-center py-10 text-xs text-slate-400 italic">Lance gastos na aba específica para alimentar o gráfico.</div>
                  ) : (
                    <>
                      <div className="w-1/2 h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={expensesByTypeChart}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={80}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {expensesByTypeChart.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <RechartsTooltip formatter={(v: any) => `R$ ${Number(v).toFixed(2)}`} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      
                      <div className="flex-1 space-y-2 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                        {expensesByTypeChart.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs font-semibold">
                            <span className="flex items-center gap-1.5 text-slate-600">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                              {item.name}
                            </span>
                            <span className="text-slate-850">R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Maiores Gastadores da Frota */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between h-[360px]">
                <div>
                  <h4 className="font-extrabold text-slate-800 text-sm mb-1">Maiores Consumos por Veículo</h4>
                  <p className="text-xs text-slate-400">Os 5 veículos da congregação com maior carga de custos operacionais acumulados</p>
                </div>
                
                <div className="flex-1 h-[250px] pt-4">
                  {expensesByVehicleChart.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center h-full text-slate-400 text-xs italic">Sem dados suficientes para consolidação.</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={expensesByVehicleChart}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                        <RechartsTooltip formatter={(v: any) => `R$ ${Number(v).toFixed(2)}`} />
                        <Bar dataKey="Valor" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

            </div>

            {/* Consumo Mensal de Combustível por Veículo */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between h-[380px]">
              <div>
                <h4 className="font-extrabold text-slate-800 text-sm mb-1 flex items-center gap-2">
                  <BarChart size={18} className="text-blue-600" /> Consumo Mensal de Combustível por Veículo
                </h4>
                <p className="text-xs text-slate-400">Evolução dos gastos com Combustível agrupados por veículo nos últimos 6 meses (R$)</p>
              </div>
              
              <div className="flex-1 h-[270px] pt-4">
                {fuelChartData.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center h-full text-slate-400 text-xs italic">
                    Sem registros de gastos com "Combustível" para visualizar a evolução mensal.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={fuelChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={9} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                      <RechartsTooltip formatter={(v: any) => `R$ ${Number(v).toFixed(2)}`} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 9 }} />
                      {uniqueFuelVehicles.map((vehicleLabel, index) => {
                        const colors = ['#2563eb', '#10b981', '#f59e0b', '#dc2626', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6'];
                        return (
                          <Bar 
                            key={vehicleLabel} 
                            dataKey={vehicleLabel} 
                            stackId="fuelStack" 
                            fill={colors[index % colors.length]} 
                            radius={[index === uniqueFuelVehicles.length - 1 ? 4 : 0, index === uniqueFuelVehicles.length - 1 ? 4 : 0, 0, 0]} 
                          />
                        );
                      })}
                    </RechartsBarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        )}

        {/* === ABA 2: LISTAGEM DE VEÍCULOS / FROTA === */}
        {activeTab === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center flex-wrap gap-4 bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 w-full md:w-80">
                <Search size={16} className="text-slate-400"/>
                <input 
                  type="text" 
                  placeholder="Pesquisar por placa, marca ou modelo..." 
                  value={searchVeiculos}
                  onChange={e => setSearchVeiculos(e.target.value)}
                  className="bg-transparent text-xs text-slate-700 outline-none w-full font-semibold"
                />
              </div>

              <div className="flex items-center gap-3">
                <select 
                  value={filterStatusVeiculo}
                  onChange={e => setFilterStatusVeiculo(e.target.value)}
                  className="bg-white border border-slate-200 p-2.5 rounded-xl text-xs font-bold text-slate-700 outline-none hover:border-slate-350 transition-colors cursor-pointer"
                >
                  <option value="todos">Status: Todos</option>
                  <option value="Disponível">Disponível</option>
                  <option value="Em Uso">Em Uso</option>
                  <option value="Em Manutenção">Em Manutenção</option>
                  <option value="Inativo">Inativo</option>
                </select>

                <button 
                  onClick={() => { resetVehicleForm(); setVehicleModalOpen(true); }}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 text-xs font-black px-4 py-2.5 rounded-xl uppercase tracking-wider transition-all shadow-md shadow-blue-500/10"
                >
                  <Plus size={16}/> Novo Veículo
                </button>
              </div>
            </div>

            {/* ALERTA VISUAL - LICENCIAMENTO / IPVA PENDENTES OU PRÓXIMOS AO VENCIMENTO */}
            {veiculos.filter(v => {
              const licStatus = docStatus(v.data_licenciamento);
              const ipvaStatus = docStatus(v.data_ipva);
              return licStatus.status !== 'regular' || ipvaStatus.status !== 'regular';
            }).length > 0 && (
              <div className="bg-amber-50 border border-amber-200/80 rounded-3xl p-4 flex gap-3 animate-fadeIn mb-1">
                <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-amber-900 uppercase tracking-wide">Atenção: Carros com Licenciamento ou IPVA Pendentes</h4>
                  <p className="text-xs text-amber-700 font-semibold">Os seguintes veículos necessitam de regularização nos próximos dias ou estão vencidos:</p>
                  <div className="flex flex-wrap gap-2 pt-1.5">
                    {veiculos.filter(v => {
                      const licStatus = docStatus(v.data_licenciamento);
                      const ipvaStatus = docStatus(v.data_ipva);
                      return licStatus.status !== 'regular' || ipvaStatus.status !== 'regular';
                    }).map(v => {
                      const lic = docStatus(v.data_licenciamento);
                      const ipva = docStatus(v.data_ipva);
                      return (
                        <span key={v.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-amber-300 rounded-xl text-[10px] font-bold text-slate-850 shadow-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          <strong>{v.modelo} ({v.placa})</strong>: 
                          {lic.status !== 'regular' && <span className="text-amber-800">Lic ({lic.label})</span>}
                          {lic.status !== 'regular' && ipva.status !== 'regular' && <span className="text-slate-300">•</span>}
                          {ipva.status !== 'regular' && <span className="text-amber-800">IPVA ({ipva.label})</span>}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TABELA DE VEÍCULOS */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/60 border-b border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                      <th className="p-4 pl-6">Modelo/Marca</th>
                      <th className="p-4">Placa</th>
                      <th className="p-4">Tipo / Detalhes</th>
                      <th className="p-4">Licenciamento</th>
                      <th className="p-4">IPVA</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right pr-6">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredVeiculos.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-10 text-center text-xs text-slate-400 italic">Nenhum veículo encontrado com os filtros selecionados.</td>
                      </tr>
                    ) : (
                      filteredVeiculos.map(veh => {
                        const licStatus = docStatus(veh.data_licenciamento);
                        const ipvaStatus = docStatus(veh.data_ipva);
                        const isWarningOrExpired = licStatus.status !== 'regular' || ipvaStatus.status !== 'regular';
                        const rowHighlightClass = isWarningOrExpired 
                          ? 'bg-amber-50/20 border-l-4 border-l-amber-500 hover:bg-amber-100/30'
                          : 'hover:bg-slate-50/30';

                        return (
                          <tr key={veh.id} className={`${rowHighlightClass} transition-all font-semibold`}>
                            <td className="p-4 pl-6">
                              <span className="text-slate-800 text-sm font-extrabold">{veh.modelo}</span>
                              <p className="text-[10px] text-slate-400 mt-0.5">{veh.marca} • Ano {veh.ano} • Cor {veh.cor || 'não informada'}</p>
                            </td>
                            <td className="p-4 space-y-0.5">
                              <span className="font-mono text-xs font-black bg-blue-50 text-blue-800 border border-blue-150 px-2.5 py-0.5 rounded-lg tracking-wider uppercase inline-block">
                                {veh.placa}
                              </span>
                            </td>
                            <td className="p-4 text-xs">
                              {veh.tipo || 'Carro'}
                              <p className="text-[9px] text-slate-400 font-mono mt-0.5" title="Renavam / Chassi">R: {veh.renavam || '-'} / C: {veh.chassi || '-'}</p>
                              {veh.documento_anexo && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const link = document.createElement('a');
                                    link.href = veh.documento_anexo!;
                                    link.download = veh.documento_nome || `doc_veiculo_${veh.placa}.pdf`;
                                    link.click();
                                  }}
                                  className="text-[9px] text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-150 rounded px-1.5 py-0.5 mt-1.5 font-extrabold flex items-center gap-1 transition-colors w-fit shadow-xs uppercase tracking-wider cursor-pointer"
                                  title="Baixar Documento do Carro"
                                >
                                  <FileText size={10} /> {veh.documento_nome || 'Doc do Carro'}
                                </button>
                              )}
                            </td>
                            <td className="p-4 md:whitespace-nowrap">
                              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border shadow-sm ${licStatus.color}`}>
                                {licStatus.label}
                              </span>
                            </td>
                            <td className="p-4 md:whitespace-nowrap">
                              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border shadow-sm ${ipvaStatus.color}`}>
                                {ipvaStatus.label}
                              </span>
                            </td>
                            <td className="p-4 text-xs">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                veh.status === 'Disponível' ? 'bg-emerald-50 text-emerald-700' :
                                veh.status === 'Em Uso' ? 'bg-blue-50 text-blue-700' :
                                veh.status === 'Em Manutenção' ? 'bg-amber-50 text-amber-700' :
                                'bg-slate-100 text-slate-600'
                              }`}>
                                {veh.status || 'Disponível'}
                              </span>
                            </td>
                            <td className="p-4 text-right pr-6">
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => { setSelectedVehicleForMaintenance(veh); setMaintenanceModalOpen(true); }}
                                  className="p-1 px-2.5 text-xs text-indigo-600 hover:text-indigo-850 hover:bg-indigo-50 border border-indigo-150 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer font-bold uppercase tracking-wider text-[10px]"
                                  type="button"
                                  title="Ver/Lançar Histórico de Manutenção"
                                >
                                  <Sliders size={12} className="text-indigo-550" /> Manutenção
                                </button>
                                <button 
                                  onClick={() => handleEditVehicle(veh)}
                                  className="p-1 px-2.5 text-xs text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-100 rounded-lg transition-colors inline-flex items-center gap-1.5"
                                  title="Editar veículo"
                                >
                                  <Edit size={12}/> Editar
                                </button>
                                <button 
                                  onClick={() => handleDeleteVehicle(veh.id)}
                                  className="p-1.5 text-slate-350 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                  title="Excluir veículo"
                                >
                                  <Trash2 size={13}/>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* === ABA 3: CADASTRO DE MOTORISTAS === */}
        {activeTab === 3 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center flex-wrap gap-4 bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 w-full md:w-80">
                <Search size={16} className="text-slate-400"/>
                <input 
                  type="text" 
                  placeholder="Pesquisar motorista..." 
                  value={searchMotoristas}
                  onChange={e => setSearchMotoristas(e.target.value)}
                  className="bg-transparent text-xs text-slate-700 outline-none w-full font-semibold"
                />
              </div>

              <button 
                onClick={() => { resetDriverForm(); setDriverModalOpen(true); }}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 text-xs font-black px-4 py-2.5 rounded-xl uppercase tracking-wider transition-all shadow-md shadow-blue-500/10"
              >
                <Plus size={16}/> Novo Motorista
              </button>
            </div>

            {/* LISTAGEM DE MOTORISTAS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMotoristas.length === 0 ? (
                <div className="col-span-full text-center p-10 bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs italic">
                  Nenhum motorista cadastrado na congregação.
                </div>
              ) : (
                filteredMotoristas.map(dri => {
                  const cnhStatus = docStatus(dri.cnh_vencimento);
                  return (
                    <div key={dri.id} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4 hover:border-blue-300 transition-colors flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-1">
                          <div>
                            <h4 className="font-extrabold text-slate-800 text-sm">{dri.nome}</h4>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Habilitação Registrada</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            dri.status === 'Ativo' ? 'bg-emerald-50 text-emerald-700' :
                            dri.status === 'Suspenso' ? 'bg-rose-50 text-rose-700' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {dri.status || 'Ativo'}
                          </span>
                        </div>

                        {/* Detalhes da Habilitação */}
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400 font-semibold">Nº CNH:</span>
                            <span className="font-mono font-bold text-slate-700">{dri.cnh_numero} (Cat {dri.cnh_categoria})</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400 font-semibold">Validade:</span>
                            <span className={`font-bold px-2 py-0.2 rounded border uppercase text-[9px] ${cnhStatus.color}`}>
                              {dri.cnh_vencimento ? `${dri.cnh_vencimento.split('-').reverse().join('/')} (${cnhStatus.label})` : 'vazio'}
                            </span>
                          </div>
                        </div>

                        {/* Contato do Motorista */}
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2 text-slate-600">
                            <Phone size={12} className="text-slate-400 shrink-0" />
                            <span className="font-semibold truncate">{dri.telefone || 'Sem telefone'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <Mail size={12} className="text-slate-400 shrink-0" />
                            <span className="font-semibold truncate">{dri.email || 'Não informado'}</span>
                          </div>
                        </div>

                        {dri.documento_anexo && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const link = document.createElement('a');
                              link.href = dri.documento_anexo!;
                              link.download = dri.documento_nome || `cnh_${dri.nome.toLowerCase().replace(/\s+/g, '_')}.pdf`;
                              link.click();
                            }}
                            className="text-[10px] text-indigo-700 hover:text-indigo-950 bg-indigo-50 hover:bg-indigo-100 border border-indigo-150 rounded-xl px-2 py-1.5 mt-2.5 font-black flex items-center justify-center gap-1.5 transition-all w-full shadow-xs uppercase tracking-wider cursor-pointer"
                            title="Baixar Documento de Habilitação / CNH"
                          >
                            <FileText size={12} className="text-indigo-600" /> {dri.documento_nome || 'Baixar CNH / Habilitação'}
                          </button>
                        )}
                      </div>

                      {/* Ações */}
                      <div className="flex justify-between items-center pt-3 border-t border-slate-100 mt-2 text-xs">
                        <button 
                          onClick={() => handleEditDriver(dri)}
                          className="text-blue-600 hover:text-blue-800 font-extrabold flex items-center gap-1"
                        >
                          <Edit size={12}/> Editar Cadastro
                        </button>
                        <button 
                          onClick={() => handleDeleteDriver(dri.id)}
                          className="text-slate-350 hover:text-rose-600 p-1"
                          title="Remover motorista"
                        >
                          <Trash2 size={13}/>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* === ABA 4: GASTOS & DESPESAS === */}
        {activeTab === 4 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center flex-wrap gap-4 bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm">
              <div className="flex items-center gap-2">
                <select 
                  value={filterTipoDespesa}
                  onChange={e => setFilterTipoDespesa(e.target.value)}
                  className="bg-white border border-slate-200 p-2.5 rounded-xl text-xs font-bold text-slate-700 outline-none hover:border-slate-350 transition-colors cursor-pointer"
                >
                  <option value="todos">Categoria: Todas as despesas</option>
                  <option value="Combustível">Combustível</option>
                  <option value="Manutenção Preventiva">Manutenção Preventiva</option>
                  <option value="Manutenção Corretiva">Manutenção Corretiva</option>
                  <option value="Seguro">Seguro</option>
                  <option value="Lavagem">Lavagem</option>
                  <option value="Estacionamento">Estacionamento</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <button 
                onClick={() => { resetExpenseForm(); setExpenseModalOpen(true); }}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 text-xs font-black px-4 py-2.5 rounded-xl uppercase tracking-wider transition-all shadow-md shadow-blue-500/10"
              >
                <Plus size={16}/> Lançar Nova Despesa
              </button>
            </div>

            {/* TABELA DE GASTOS */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/60 border-b border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                      <th className="p-4 pl-6">Data</th>
                      <th className="p-4">Veículo</th>
                      <th className="p-4">Tipo de Gasto</th>
                      <th className="p-4">Motorista Relacionado</th>
                      <th className="p-4">Descrição/Obs</th>
                      <th className="p-4">Odômetro (KM)</th>
                      <th className="p-4">Valor</th>
                      <th className="p-4 text-right pr-6">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredDespesas.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-10 text-center text-xs text-slate-400 italic">Nenhum gasto ou despesa registrado até o momento.</td>
                      </tr>
                    ) : (
                      filteredDespesas.map(exp => {
                        const veh = veiculos.find(v => v.id === exp.veiculo_id);
                        const dri = motoristas.find(m => m.id === exp.motorista_id);

                        return (
                          <tr key={exp.id} className="hover:bg-slate-50/30 transition-all font-semibold">
                            <td className="p-4 pl-6 text-xs shrink-0">
                              {exp.data ? exp.data.split('-').reverse().join('/') : '-'}
                            </td>
                            <td className="p-4 text-xs">
                              {veh ? (
                                <div>
                                  <span className="text-slate-800 font-bold block">{veh.modelo}</span>
                                  <span className="text-[10px] text-slate-400 font-mono">{veh.placa}</span>
                                </div>
                              ) : (
                                <span className="text-rose-500 font-bold italic">Aparelho desvinculado</span>
                              )}
                            </td>
                            <td className="p-4 text-xs">
                              <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${
                                exp.tipo === 'Combustível' ? 'bg-indigo-50 text-indigo-700' :
                                exp.tipo.startsWith('Manutenção') ? 'bg-amber-50 text-amber-700' :
                                exp.tipo === 'Seguro' ? 'bg-blue-50 text-blue-700' :
                                'bg-slate-100 text-slate-650'
                              }`}>
                                {exp.tipo}
                              </span>
                            </td>
                            <td className="p-4 text-xs text-slate-600">
                              {dri ? dri.nome : 'Nenhum'}
                            </td>
                            <td className="p-4 text-xs text-slate-500 max-w-xs truncate" title={exp.descricao}>
                              {exp.descricao || '-'}
                            </td>
                            <td className="p-4 text-xs font-mono text-slate-500">
                              {exp.odometro ? `${exp.odometro.toLocaleString('pt-BR')} KM` : '-'}
                            </td>
                            <td className="p-4 text-xs font-bold text-emerald-600">
                              R$ {exp.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="p-4 text-right pr-6">
                              <div className="flex gap-2 justify-end">
                                <button 
                                  onClick={() => handleEditExpense(exp)}
                                  className="p-1 px-2 text-[11px] text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-100 rounded-lg transition-colors inline-flex items-center gap-1"
                                >
                                  Editar
                                </button>
                                <button 
                                  onClick={() => handleDeleteExpense(exp.id)}
                                  className="p-1.5 text-slate-300 hover:text-rose-600 transition-colors"
                                >
                                  <Trash2 size={13}/>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* === ABA 5: CONTROLE DE MULTAS === */}
        {activeTab === 5 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center flex-wrap gap-4 bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm">
              <div className="flex items-center gap-2">
                <select 
                  value={filterStatusMulta}
                  onChange={e => setFilterStatusMulta(e.target.value)}
                  className="bg-white border border-slate-200 p-2.5 rounded-xl text-xs font-bold text-slate-700 outline-none hover:border-slate-350 transition-colors cursor-pointer"
                >
                  <option value="todos">Status da multa: Todas</option>
                  <option value="Pendente">Pendentes / Processamento</option>
                  <option value="Paga">Pagas</option>
                  <option value="Em Recurso">Em Recursos / Defesa</option>
                  <option value="Vencida">Vencidas</option>
                </select>
              </div>

              <button 
                onClick={() => { resetFineForm(); setFineModalOpen(true); }}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 text-xs font-black px-4 py-2.5 rounded-xl uppercase tracking-wider transition-all shadow-md shadow-blue-500/10"
              >
                <Plus size={16}/> Registrar Nova Multa
              </button>
            </div>

            {/* TABELA DE MULTAS */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/60 border-b border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                      <th className="p-4 pl-6">Auto Infração / Data</th>
                      <th className="p-4">Veículo</th>
                      <th className="p-4">Infracção</th>
                      <th className="p-4">Motorista Notificado</th>
                      <th className="p-4">Pontuação CNH</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Valor</th>
                      <th className="p-4 text-right pr-6">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredMultas.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-10 text-center text-xs text-slate-400 italic">Nenhuma multa registrada.</td>
                      </tr>
                    ) : (
                      filteredMultas.map(fin => {
                        const veh = veiculos.find(v => v.id === fin.veiculo_id);
                        const dri = motoristas.find(m => m.id === fin.motorista_id);

                        return (
                          <tr key={fin.id} className="hover:bg-slate-50/30 transition-all font-semibold">
                            <td className="p-4 pl-6 text-xs text-slate-800">
                              <span className="font-mono bg-slate-100 text-slate-650 px-2.5 py-0.5 rounded-lg text-[10px] border font-bold block w-fit mb-1">{fin.auto_infracao || '-'}</span>
                              <span>{fin.data_multa ? fin.data_multa.split('-').reverse().join('/') : '-'}</span>
                            </td>
                            <td className="p-4 text-xs">
                              {veh ? (
                                <div>
                                  <span className="text-slate-850 font-bold block">{veh.modelo}</span>
                                  <span className="text-[10px] text-slate-400 font-mono">{veh.placa}</span>
                                </div>
                              ) : (
                                <span className="text-rose-500 font-bold italic">Não identificado</span>
                              )}
                            </td>
                            <td className="p-4 text-xs text-slate-700 font-bold max-w-xs truncate" title={fin.infracao}>
                              {fin.infracao}
                            </td>
                            <td className="p-4 text-xs text-slate-600">
                              {dri ? dri.nome : <span className="text-slate-400 font-bold italic">Não identificado</span>}
                            </td>
                            <td className="p-4 text-xs text-center md:text-left text-slate-500">
                              <span className={`px-2 py-0.5 font-bold text-[10px] rounded ${Number(fin.pontos) >= 7 ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
                                {fin.pontos || 0} pto{Number(fin.pontos) !== 1 ? 's' : ''}
                              </span>
                            </td>
                            <td className="p-4 text-xs">
                              <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                                fin.status === 'Paga' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' :
                                fin.status === 'Pendente' ? 'bg-amber-50 text-amber-800 border border-amber-100' :
                                fin.status === 'Em Recurso' ? 'bg-blue-50 text-blue-800 border border-blue-100' :
                                'bg-rose-50 text-rose-800 border border-rose-100'
                              }`}>
                                {fin.status || 'Pendente'}
                              </span>
                            </td>
                            <td className="p-4 text-xs font-bold text-rose-600">
                              R$ {fin.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="p-4 text-right pr-6">
                              <div className="flex gap-2 justify-end">
                                <button 
                                  onClick={() => handleEditFine(fin)}
                                  className="p-1 px-2 text-[11px] text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-100 rounded-lg transition-colors inline-flex items-center gap-1"
                                >
                                  Editar
                                </button>
                                <button 
                                  onClick={() => handleDeleteFine(fin.id)}
                                  className="p-1.5 text-slate-300 hover:text-rose-600 transition-colors"
                                >
                                  <Trash2 size={13}/>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ==================================================================== */}
      {/* MODAL EDIT CLOUD: VEÍCULOS */}
      {/* ==================================================================== */}
      {vehicleModalOpen && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[999] animate-fadeIn text-slate-800 font-sans">
          <div className="bg-white rounded-[2.5rem] p-6 md:p-8 w-full max-w-2xl border border-slate-200 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-extrabold text-slate-850 flex items-center gap-2">
                  <Truck className="text-blue-600"/>
                  {editingVehicle ? 'Editar Veículo' : 'Cadastrar Novo Veículo da Frota'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">Preencha com exatidão as informações do Renavam, licenciamento e placas.</p>
              </div>
              <button 
                onClick={() => setVehicleModalOpen(false)}
                className="p-2 hover:bg-slate-150 rounded-xl transition-all text-slate-400 hover:text-slate-600"
              >
                <X size={18}/>
              </button>
            </div>

            <form onSubmit={handleSaveVehicle} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-505 font-bold mb-1.5 uppercase">Marca / Fabricante *</label>
                  <input 
                    type="text" required value={vMarca} onChange={e => setVMarca(e.target.value)}
                    placeholder="Ex: Chevrolet, Volkswagen, Fiat"
                    className="w-full border-2 border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-505 font-bold mb-1.5 uppercase">Modelo do Veículo *</label>
                  <input 
                    type="text" required value={vModelo} onChange={e => setVModelo(e.target.value)}
                    placeholder="Ex: Spin, Kombi, Ônibus Executivo"
                    className="w-full border-2 border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 outline-none font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-slate-505 font-bold mb-1.5 uppercase">Placa * (Letras e Números)</label>
                  <input 
                    type="text" required value={vPlaca} onChange={e => setVPlaca(e.target.value)}
                    placeholder="PRB4F12"
                    className="w-full border-2 border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 outline-none font-extrabold uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-505 font-bold mb-1.5 uppercase">Ano Fabr.</label>
                  <input 
                    type="number" value={vAno} onChange={e => setVAno(Number(e.target.value))}
                    className="w-full border-2 border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-505 font-bold mb-1.5 uppercase">Cor Predominante</label>
                  <input 
                    type="text" value={vCor} onChange={e => setVCor(e.target.value)}
                    placeholder="Branca, Prata"
                    className="w-full border-2 border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 outline-none font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-505 font-bold mb-1.5 uppercase">Tipo de Utilitário</label>
                  <select 
                    value={vTipo} onChange={e => setVTipo(e.target.value as any)}
                    className="w-full border-2 border-slate-200 focus:border-blue-500 bg-white rounded-xl px-3.5 py-2.5 outline-none font-bold"
                  >
                    <option value="Carro">Carro (Passeio)</option>
                    <option value="Van">Van / Micro-ônibus</option>
                    <option value="Ônibus">Ônibus Grande</option>
                    <option value="Moto">Motos</option>
                    <option value="Utilitário">Utilitário (Picape/L/Furgão)</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-505 font-bold mb-1.5 uppercase">Nº RENAVAM</label>
                  <input 
                    type="text" value={vRenavam} onChange={e => setVRenavam(e.target.value)}
                    placeholder="99999999999"
                    className="w-full border-2 border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 outline-none font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-505 font-bold mb-1.5 uppercase">Código Chassi</label>
                  <input 
                    type="text" value={vChassi} onChange={e => setVChassi(e.target.value)}
                    placeholder="9A8B..."
                    className="w-full border-2 border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 outline-none font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-505 font-bold mb-1.5 uppercase text-amber-600">Vencimento Licenciamento</label>
                  <input 
                    type="date" value={vDataLicenciamento} onChange={e => setVDataLicenciamento(e.target.value)}
                    className="w-full border-2 border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 outline-none font-bold text-amber-600 bg-amber-50/10"
                  />
                </div>
                <div>
                  <label className="block text-slate-505 font-bold mb-1.5 uppercase text-indigo-600 font-semibold">Dia de Vencimento IPVA</label>
                  <input 
                    type="date" value={vDataIpva} onChange={e => setVDataIpva(e.target.value)}
                    className="w-full border-2 border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 outline-none font-bold text-indigo-600 bg-indigo-50/10"
                  />
                </div>
                <div>
                  <label className="block text-slate-505 font-bold mb-1.5 uppercase">Status Operacional</label>
                  <select 
                    value={vStatus} onChange={e => setVStatus(e.target.value as any)}
                    className="w-full border-2 border-slate-200 focus:border-blue-500 bg-white rounded-xl px-3.5 py-2.5 outline-none font-bold"
                  >
                    <option value="Disponível">✅ Disponível</option>
                    <option value="Em Uso">🔑 Em Uso</option>
                    <option value="Em Manutenção">🛠️ Em Manutenção</option>
                    <option value="Inativo">⚠️ Inativo</option>
                  </select>
                </div>
              </div>

              {/* ANEXAR DOCUMENTO DO VEÍCULO */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                <label className="block text-slate-750 font-black uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                  <FileText size={14} className="text-blue-600" /> Anexar CRLV / Documento do Veículo (PDF / Imagem)
                </label>
                
                {vDocumentoAnexo ? (
                  <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-blue-200 shadow-xs animate-fadeIn">
                    <div className="flex items-center gap-2.5 truncate flex-1 min-w-0">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                        <FileCheck size={16} />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-800 truncate" title={vDocumentoNome}>
                          {vDocumentoNome || 'documento_veiculo.pdf'}
                        </p>
                        <p className="text-[10px] text-emerald-600 font-bold">Arquivo anexado com sucesso!</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <button
                        type="button"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = vDocumentoAnexo;
                          link.download = vDocumentoNome || 'documento_veiculo.pdf';
                          link.click();
                        }}
                        className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-blue-650 rounded-lg border border-slate-205 transition-colors cursor-pointer text-[10px] font-bold flex items-center gap-1"
                        title="Visualizar documento atual"
                      >
                        Baixar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setVDocumentoAnexo('');
                          setVDocumentoNome('');
                        }}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-550 rounded-lg border border-rose-200 transition-colors cursor-pointer flex items-center justify-center"
                        title="Remover anexo"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-2xl p-4 text-center cursor-pointer bg-white group">
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            setVDocumentoAnexo(reader.result as string);
                            setVDocumentoNome(file.name);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="p-2 flex flex-col items-center justify-center gap-1.5">
                      <div className="p-2 bg-slate-100 group-hover:bg-blue-50 text-slate-400 group-hover:text-blue-500 rounded-xl transition-colors">
                        <Plus size={16} />
                      </div>
                      <span className="text-xs font-bold text-slate-600 group-hover:text-blue-600">Escolher Documento ou Soltar aqui</span>
                      <span className="text-[10px] text-slate-400">PDF ou imagens de até 5MB</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button 
                  type="button" onClick={() => setVehicleModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border-2 border-slate-200 hover:bg-slate-100 font-bold transition-all text-xs uppercase"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black transition-all text-xs uppercase flex items-center gap-1"
                >
                  <Plus size={14}/> {editingVehicle ? 'Atualizar Cad.' : 'Salvar Veículo'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ==================================================================== */}
      {/* MODAL EDIT CLOUD: MOTORISTAS */}
      {/* ==================================================================== */}
      {driverModalOpen && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[999] animate-fadeIn text-slate-800 font-sans">
          <div className="bg-white rounded-[2.5rem] p-6 md:p-8 w-full max-w-xl border border-slate-200 shadow-2xl space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-extrabold text-slate-850 flex items-center gap-2">
                  <Users className="text-blue-605"/>
                  {editingDriver ? 'Editar Motorista' : 'Cadastrar Novo Motorista Habilitado'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">Insira a identificação do portador da CNH e verifique os pontos de compliance.</p>
              </div>
              <button 
                onClick={() => setDriverModalOpen(false)}
                className="p-2 hover:bg-slate-150 rounded-xl transition-all text-slate-400"
              >
                <X size={18}/>
              </button>
            </div>

            <form onSubmit={handleSaveDriver} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-505 font-bold mb-1.5 uppercase">Vincular Membro da Igreja (Opcional)</label>
                <select 
                  value={dMembroId} onChange={e => {
                    const id = e.target.value;
                    setDMembroId(id);
                    const found = db.membros?.find((m: any) => m.id === id);
                    if (found) {
                      setDNome(found.nome);
                      setDTelefone(found.telefone || '');
                      setDEmail(found.email || '');
                    }
                  }}
                  className="w-full border-2 border-slate-200 focus:border-blue-500 bg-white rounded-xl px-3.5 py-2.5 outline-none font-bold"
                >
                  <option value="">-- Autopreencher escolhendo do cadastro de membros --</option>
                  {(db.membros || []).map((m: any) => (
                    <option key={m.id} value={m.id}>{m.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-505 font-bold mb-1.5 uppercase">Nome do Motorista *</label>
                <input 
                  type="text" required value={dNome} onChange={e => setDNome(e.target.value)}
                  placeholder="Nome por extenso"
                  className="w-full border-2 border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-slate-505 font-bold mb-1.5 uppercase">Nº Registro CNH *</label>
                  <input 
                    type="text" required value={dCnhNumero} onChange={e => setDCnhNumero(e.target.value)}
                    placeholder="Somente números da CNH"
                    className="w-full border-2 border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 outline-none font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-505 font-bold mb-1.5 uppercase">Categoria CNH</label>
                  <input 
                    type="text" value={dCnhCategoria} onChange={e => setDCnhCategoria(e.target.value.toUpperCase())}
                    placeholder="B, D, AD"
                    className="w-full border-2 border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 outline-none font-extrabold uppercase text-center"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-505 font-bold mb-1.5 uppercase text-rose-500">Vencimento da CNH</label>
                  <input 
                    type="date" value={dCnhVencimento} onChange={e => setDCnhVencimento(e.target.value)}
                    className="w-full border-2 border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 outline-none font-bold text-rose-500 bg-rose-50/10"
                  />
                </div>
                <div>
                  <label className="block text-slate-505 font-bold mb-1.5 uppercase">Status do Habilitado</label>
                  <select 
                    value={dStatus} onChange={e => setDStatus(e.target.value as any)}
                    className="w-full border-2 border-slate-200 focus:border-blue-500 bg-white rounded-xl px-3.5 py-2.5 outline-none font-bold"
                  >
                    <option value="Ativo">✅ Ativo no Cadastro</option>
                    <option value="Suspenso">⚠️ Suspenso pelo Órgão</option>
                    <option value="Inativo">Inativo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-505 font-bold mb-1.5 uppercase">Telefone</label>
                  <input 
                    type="text" value={dTelefone} onChange={e => setDTelefone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full border-2 border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-505 font-bold mb-1.5 uppercase">Email Correspondência</label>
                  <input 
                    type="email" value={dEmail} onChange={e => setDEmail(e.target.value)}
                    placeholder="email@servidor.com"
                    className="w-full border-2 border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 outline-none font-bold"
                  />
                </div>
              </div>

              {/* ANEXAR DOCUMENTO DE HABILITAÇÃO / CNH */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                <label className="block text-slate-750 font-black uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                  <FileText size={14} className="text-indigo-600" /> Anexar Documento de Habilitação / CNH (PDF / Imagem)
                </label>
                
                {dDocumentoAnexo ? (
                  <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-indigo-200 shadow-xs animate-fadeIn">
                    <div className="flex items-center gap-2.5 truncate flex-1 min-w-0">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                        <FileCheck size={16} />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-800 truncate" title={dDocumentoNome}>
                          {dDocumentoNome || 'documento_cnh.pdf'}
                        </p>
                        <p className="text-[10px] text-emerald-600 font-bold">Arquivo anexado com sucesso!</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <button
                        type="button"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = dDocumentoAnexo;
                          link.download = dDocumentoNome || 'documento_cnh.pdf';
                          link.click();
                        }}
                        className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-indigo-650 rounded-lg border border-slate-205 transition-colors cursor-pointer text-[10px] font-bold flex items-center gap-1"
                        title="Visualizar documento atual"
                      >
                        Baixar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDDocumentoAnexo('');
                          setDDocumentoNome('');
                        }}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-550 rounded-lg border border-rose-200 transition-colors cursor-pointer flex items-center justify-center"
                        title="Remover anexo"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-2xl p-4 text-center cursor-pointer bg-white group">
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            setDDocumentoAnexo(reader.result as string);
                            setDDocumentoNome(file.name);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="p-2 flex flex-col items-center justify-center gap-1.5">
                      <div className="p-2 bg-slate-100 group-hover:bg-indigo-50 text-slate-400 group-hover:text-indigo-505 rounded-xl transition-colors">
                        <Plus size={16} />
                      </div>
                      <span className="text-xs font-bold text-slate-600 group-hover:text-indigo-600">Escolher Documento ou Soltar aqui</span>
                      <span className="text-[10px] text-slate-400">PDF ou imagens de até 5MB</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button 
                  type="button" onClick={() => setDriverModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border-2 border-slate-200 hover:bg-slate-100 font-bold transition-all text-xs uppercase"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black transition-all text-xs uppercase"
                >
                  {editingDriver ? 'Atualizar' : 'Salvar Motorista'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ==================================================================== */}
      {/* MODAL EDIT CLOUD: GASTOS & DESPESAS */}
      {/* ==================================================================== */}
      {expenseModalOpen && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[999] animate-fadeIn text-slate-800 font-sans">
          <div className="bg-white rounded-[2.5rem] p-6 md:p-8 w-full max-w-xl border border-slate-200 shadow-2xl space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-extrabold text-slate-850 flex items-center gap-2">
                  <DollarSign className="text-emerald-555"/>
                  {editingExpense ? 'Editar Despesa' : 'Lançar Gasto com Veículo'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">Organize todos os consumos de combustíveis e ordens de manutenções.</p>
              </div>
              <button 
                onClick={() => setExpenseModalOpen(false)}
                className="p-2 hover:bg-slate-150 rounded-xl transition-all text-slate-400"
              >
                <X size={18}/>
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-505 font-bold mb-1.5 uppercase">Veículo *</label>
                  <select 
                    value={eVeiculoId} required onChange={e => setEVeiculoId(e.target.value)}
                    className="w-full border-2 border-slate-200 focus:border-blue-500 bg-white rounded-xl px-3.5 py-2.5 outline-none font-bold"
                  >
                    <option value="">-- Selecione o Veículo --</option>
                    {veiculos.map(v => (
                      <option key={v.id} value={v.id}>{v.modelo} ({v.placa})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-505 font-bold mb-1.5 uppercase">Tipo de Gasto *</label>
                  <select 
                    value={eTipo} required onChange={e => setETipo(e.target.value as any)}
                    className="w-full border-2 border-slate-200 focus:border-blue-500 bg-white rounded-xl px-3.5 py-2.5 outline-none font-bold"
                  >
                    <option value="Combustível">Combustível (Abastecimento)</option>
                    <option value="Manutenção Preventiva">Manutenção Preventiva</option>
                    <option value="Manutenção Corretiva">Manutenção Corretiva (Conserto)</option>
                    <option value="Seguro">Seguro Mensal/Anual</option>
                    <option value="Lavagem">Lavagem / Limpeza</option>
                    <option value="Estacionamento">Estacionamento / Pedágio</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-505 font-bold mb-1.5 uppercase">Valor da Despesa (R$) *</label>
                  <input 
                    type="number" step="0.01" required value={eValor} onChange={e => setEValor(e.target.value)}
                    placeholder="0.00"
                    className="w-full border-2 border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 outline-none font-extrabold text-emerald-600 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-505 font-bold mb-1.5 uppercase">Odômetro Atual (KM)</label>
                  <input 
                    type="number" value={eOdometro} onChange={e => setEOdometro(e.target.value)}
                    placeholder="Ex: 54200"
                    className="w-full border-2 border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 outline-none font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-505 font-bold mb-1.5 uppercase">Data do Lançamento *</label>
                  <input 
                    type="date" required value={eData} onChange={e => setEData(e.target.value)}
                    className="w-full border-2 border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-505 font-bold mb-1.5 uppercase">Motorista Habilitado no Momento</label>
                <select 
                  value={eMotoristaId} onChange={e => setEMoristaId(e.target.value)}
                  className="w-full border-2 border-slate-200 focus:border-blue-500 bg-white rounded-xl px-3.5 py-2.5 outline-none font-bold"
                >
                  <option value="">-- Selecione o Motorista se houver --</option>
                  {motoristas.map(m => (
                    <option key={m.id} value={m.id}>{m.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-505 font-bold mb-1.5 uppercase">Descrição / Local / Observações</label>
                <textarea 
                  rows={2} value={eDescricao} onChange={e => setEDescricao(e.target.value)}
                  placeholder="Ex: Nota fiscal Nº 4125 - Posto Shell Ipiranga. Abastecimento completo."
                  className="w-full border-2 border-slate-200 focus:border-blue-500 rounded-xl p-3 outline-none leading-relaxed font-semibold text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button 
                  type="button" onClick={() => setExpenseModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border-2 border-slate-200 hover:bg-slate-100 font-bold transition-all text-xs uppercase"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black transition-all text-xs uppercase"
                >
                  Salvar Despesa
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ==================================================================== */}
      {/* MODAL EDIT CLOUD: MULTAS */}
      {/* ==================================================================== */}
      {fineModalOpen && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[999] animate-fadeIn text-slate-800 font-sans">
          <div className="bg-white rounded-[2.5rem] p-6 md:p-8 w-full max-w-xl border border-slate-200 shadow-2xl space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-extrabold text-slate-850 flex items-center gap-2">
                  <AlertTriangle className="text-rose-500"/>
                  {editingFine ? 'Editar Lançamento Multa' : 'Registrar Notificação de Multa'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">Insira os dados da autuação para posterior controle de pagamentos ou recursos.</p>
              </div>
              <button 
                onClick={() => setFineModalOpen(false)}
                className="p-2 hover:bg-slate-150 rounded-xl transition-all text-slate-400"
              >
                <X size={18}/>
              </button>
            </div>

            <form onSubmit={handleSaveFine} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-505 font-bold mb-1.5 uppercase">Veículo *</label>
                  <select 
                    value={fVeiculoId} required onChange={e => setFVeiculoId(e.target.value)}
                    className="w-full border-2 border-slate-200 focus:border-blue-500 bg-white rounded-xl px-3.5 py-2.5 outline-none font-bold"
                  >
                    <option value="">-- Selecione o Veículo --</option>
                    {veiculos.map(v => (
                      <option key={v.id} value={v.id}>{v.modelo} ({v.placa})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-505 font-bold mb-1.5 uppercase">Motorista Responsável</label>
                  <select 
                    value={fMotoristaId} onChange={e => setFMoristaId(e.target.value)}
                    className="w-full border-2 border-slate-200 focus:border-blue-500 bg-white rounded-xl px-3.5 py-2.5 outline-none font-bold"
                  >
                    <option value="">-- Selecione o Condutor --</option>
                    {motoristas.map(m => (
                      <option key={m.id} value={m.id}>{m.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-505 font-bold mb-1.5 uppercase">Cód. Auto Infração / Guia</label>
                  <input 
                    type="text" value={fAutoInfracao} onChange={e => setFAutoInfracao(e.target.value)}
                    placeholder="Ex: ACT-001242"
                    className="w-full border-2 border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 outline-none font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-505 font-bold mb-1.5 uppercase">Data da Infração *</label>
                  <input 
                    type="date" required value={fDataMulta} onChange={e => setFDataMulta(e.target.value)}
                    className="w-full border-2 border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-505 font-bold mb-1.5 uppercase">Vencimento da Guia</label>
                  <input 
                    type="date" value={fDataVencimento} onChange={e => setFDataVencimento(e.target.value)}
                    className="w-full border-2 border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 outline-none font-bold text-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-505 font-bold mb-1.5 uppercase">Artigo / Descrição da Infração *</label>
                <input 
                  type="text" required value={fInfracao} onChange={e => setFInfracao(e.target.value)}
                  placeholder="Ex: Art. 218 - Transitar em velocidade superior à máxima permitida em até 20%"
                  className="w-full border-2 border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 outline-none font-bold text-xs"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-505 font-bold mb-1.5 uppercase">Gabinete / Pontos CNH</label>
                  <input 
                    type="number" value={fPontos} onChange={e => setFPontos(e.target.value)}
                    placeholder="3, 4, 5, 7"
                    className="w-full border-2 border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-505 font-bold mb-1.5 uppercase">Valor da Infração (R$) *</label>
                  <input 
                    type="number" step="0.01" required value={fValor} onChange={e => setFValor(e.target.value)}
                    placeholder="0.00"
                    className="w-full border-2 border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 outline-none font-extrabold text-rose-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-505 font-bold mb-1.5 uppercase">Status do Pagamento</label>
                  <select 
                    value={fStatus} onChange={e => setFStatus(e.target.value as any)}
                    className="w-full border-2 border-slate-200 focus:border-blue-500 bg-white rounded-xl px-3.5 py-2.5 outline-none font-bold"
                  >
                    <option value="Pendente">⚠️ Pendente de Pagamento</option>
                    <option value="Paga">✅ Quitada (Paga)</option>
                    <option value="Em Recurso">⚖️ Em Recurso Constitucional</option>
                    <option value="Vencida">❌ Vencida</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button 
                  type="button" onClick={() => setFineModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border-2 border-slate-200 hover:bg-slate-100 font-bold transition-all text-xs uppercase"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black transition-all text-xs uppercase"
                >
                  Salvar Registro
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ==================================================================== */}
      {/* MODAL: HISTÓRICO DE MANUTENÇÃO DO VEÍCULO */}
      {/* ==================================================================== */}
      {maintenanceModalOpen && selectedVehicleForMaintenance && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[999] animate-fadeIn text-slate-800 font-sans">
          <div className="bg-white rounded-[2.5rem] p-6 md:p-8 w-full max-w-4xl border border-slate-200 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-extrabold text-slate-850 flex items-center gap-2">
                  <Sliders className="text-indigo-600"/>
                  Histórico de Manutenções
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Veículo: <strong className="text-slate-700">{selectedVehicleForMaintenance.modelo}</strong> • Placa: <strong className="text-slate-700">{selectedVehicleForMaintenance.placa}</strong> • {selectedVehicleForMaintenance.marca} ({selectedVehicleForMaintenance.ano})
                </p>
              </div>
              <button 
                onClick={() => setMaintenanceModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 cursor-pointer"
              >
                <X size={18}/>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* COLUNA ESQUERDA: REGISTRAR */}
              <div className="lg:col-span-12 xl:col-span-5 bg-slate-50 p-5 rounded-3xl border border-slate-200/80 space-y-4">
                <h4 className="text-xs font-black uppercase text-indigo-750 tracking-wider">Registrar Nova Manutenção</h4>
                <form onSubmit={handleSaveMaintenance} className="space-y-3.5 text-xs font-semibold">
                  <div>
                    <label className="block text-slate-505 font-bold mb-1 uppercase text-[10px]">Data do Serviço *</label>
                    <input 
                      type="date" required value={mDate} onChange={e => setMDate(e.target.value)}
                      className="w-full border-2 border-slate-200 focus:border-indigo-500 bg-white rounded-xl px-3 py-2 outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-505 font-bold mb-1 uppercase text-[10px]">Tipo de Manutenção *</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setMType('Manutenção Preventiva')}
                        className={`py-2 rounded-xl border text-center font-bold transition-all ${
                          mType === 'Manutenção Preventiva' 
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                            : 'bg-white text-slate-650 border-slate-200 hover:border-slate-350'
                        }`}
                      >
                        Preventiva
                      </button>
                      <button
                        type="button"
                        onClick={() => setMType('Manutenção Corretiva')}
                        className={`py-2 rounded-xl border text-center font-bold transition-all ${
                          mType === 'Manutenção Corretiva' 
                            ? 'bg-amber-600 text-white border-amber-600 shadow-sm' 
                            : 'bg-white text-slate-650 border-slate-200 hover:border-slate-350'
                        }`}
                      >
                        Corretiva
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-505 font-bold mb-1 uppercase text-[10px]">Custo / Valor (R$)*</label>
                      <input 
                        type="number" step="0.01" required placeholder="0,00" value={mValue} onChange={e => setMValue(e.target.value)}
                        className="w-full border-2 border-slate-200 focus:border-indigo-500 bg-white rounded-xl px-3 py-2 outline-none font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-505 font-bold mb-1 uppercase text-[10px]">Odômetro (KM)</label>
                      <input 
                        type="number" placeholder="Ex: 85000" value={mOdometer} onChange={e => setMOdometer(e.target.value)}
                        className="w-full border-2 border-slate-200 focus:border-indigo-500 bg-white rounded-xl px-3 py-2 outline-none font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-505 font-bold mb-1 uppercase text-[10px]">Descrição do Serviço realizado *</label>
                    <textarea 
                      required rows={3} placeholder="Ex: Troca de pastilhas de freio traseiras, óleo do motor e filtros." value={mDescription} onChange={e => setMDescription(e.target.value)}
                      className="w-full border-2 border-slate-200 focus:border-indigo-500 bg-white rounded-xl px-3 py-2 outline-none font-bold"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black uppercase tracking-wider text-xs transition-all shadow-md shadow-indigo-550/10 cursor-pointer mt-2"
                  >
                    Registrar Manutenção
                  </button>
                </form>
              </div>

              {/* COLUNA DIREITA: HISTÓRICO / LINHA DO TEMPO */}
              <div className="lg:col-span-12 xl:col-span-7 space-y-4">
                <h4 className="text-xs font-black uppercase text-slate-450 tracking-wider">Histórico de Lançamentos Registrados</h4>
                
                <div className="max-h-[460px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                  {despesas.filter(d => d.veiculo_id === selectedVehicleForMaintenance.id && (d.tipo === 'Manutenção Preventiva' || d.tipo === 'Manutenção Corretiva')).length === 0 ? (
                    <div className="text-center py-12 text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-4">
                      <p className="text-xs font-semibold italic">Nenhum registro de manutenção encontrado para este veículo.</p>
                      <p className="text-[10px] mt-1">Preencha o formulário ao lado de cadastro para realizar o seu primeiro lançamento.</p>
                    </div>
                  ) : (
                    [...despesas.filter(d => d.veiculo_id === selectedVehicleForMaintenance.id && (d.tipo === 'Manutenção Preventiva' || d.tipo === 'Manutenção Corretiva'))]
                      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                      .map(log => (
                        <div key={log.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-slate-300 transition-colors space-y-2.5 relative group">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1 flex-1">
                              <span className={`inline-block px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wide ${
                                log.tipo === 'Manutenção Preventiva' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                              }`}>
                                {log.tipo}
                              </span>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                                <Calendar size={11} /> {log.data ? log.data.split('-').reverse().join('/') : '-'}
                                {log.odometro ? (
                                  <>
                                    <span>•</span>
                                    <span>Odômetro: {log.odometro.toLocaleString('pt-BR')} KM</span>
                                  </>
                                ) : null}
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="text-sm font-black text-slate-850">
                                R$ {log.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                              <button
                                onClick={() => handleDeleteExpense(log.id)}
                                className="p-1 text-slate-300 hover:text-rose-550 rounded hover:bg-rose-50 transition-colors opacity-100 md:opacity-0 group-hover:opacity-100 cursor-pointer shrink-0"
                                title="Excluir este lançamento"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          <p className="text-xs text-slate-650 font-medium leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            {log.descricao || 'Sem descrição cadastrada.'}
                          </p>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button 
                type="button" onClick={() => setMaintenanceModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border-2 border-slate-200 hover:bg-slate-100 font-bold transition-all text-xs uppercase cursor-pointer"
              >
                Fechar Painel
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default ModuleFrotas;
