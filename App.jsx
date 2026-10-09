import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, collection, onSnapshot, doc, setDoc, addDoc, deleteDoc, updateDoc
} from 'firebase/firestore';
import { 
  Lock, Home, Database, ShoppingBag, Calendar, User, 
  Search, Plus, Eye, Edit, Trash2, Mic, Image as ImageIcon, Save, ArrowLeft, X, BarChart3, TrendingUp, DollarSign, Sparkles, Printer, CheckCircle
} from 'lucide-react';

const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'demsy-couture-app';

const theme = {
  bg: '#0f1015',
  cardBg: '#171923',
  sidebarBg: '#12141c',
  bordeaux: '#9b111e',
  bordeauxHover: '#7a0d17',
  accentGold: '#d4af37',
  text: '#f3f4f6',
  textMuted: '#9ca3af',
  border: '#2d3748'
};

export default function App() {
  const [user, setUser] = useState(null);
  const [isAppAuthenticated, setIsAppAuthenticated] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [navHistory, setNavHistory] = useState(['home']);

  const navigateTo = (tab) => {
    if (tab === activeTab) return;
    setNavHistory(prev => [...prev, tab]);
    setActiveTab(tab);
  };

  const goBack = () => {
    setNavHistory(prev => {
      if (prev.length <= 1) return prev;
      const newHist = prev.slice(0, -1);
      setActiveTab(newHist[newHist.length - 1]);
      return newHist;
    });
  };

  const [clients, setClients] = useState([]);
  const [orders, setOrders] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth error:", err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !isAppAuthenticated) return;

    const clientsRef = collection(db, 'artifacts', appId, 'public', 'data', 'clients');
    const ordersRef = collection(db, 'artifacts', appId, 'public', 'data', 'orders');
    const appointmentsRef = collection(db, 'artifacts', appId, 'public', 'data', 'appointments');

    const unsubClients = onSnapshot(clientsRef, (snapshot) => {
      setClients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, console.error);

    const unsubOrders = onSnapshot(ordersRef, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, console.error);

    const unsubAppointments = onSnapshot(appointmentsRef, (snapshot) => {
      setAppointments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, console.error);

    return () => {
      unsubClients();
      unsubOrders();
      unsubAppointments();
    };
  }, [user, isAppAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (accessCode === '16129489f') {
      setIsAppAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError("Code d'accès incorrect. Veuillez réessayer.");
      setAccessCode('');
    }
  };

  if (!isAppAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: theme.bg }}>
        <div className="p-8 rounded-2xl shadow-2xl max-w-md w-full border border-gray-800 relative overflow-hidden" style={{ backgroundColor: theme.cardBg }}>
          <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: `linear-gradient(90deg, ${theme.bordeaux}, ${theme.accentGold})` }}></div>
          
          <div className="text-center mb-8 pt-4">
            <div className="inline-flex p-3 rounded-2xl bg-black/40 mb-3 border border-red-900/30">
              <Sparkles size={28} style={{ color: theme.accentGold }} />
            </div>
            <h1 className="text-3xl font-serif font-bold mb-1 tracking-wider text-white">DEMSY COUTURE</h1>
            <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold">ESPACE DE TRAVAIL EXCLUSIF</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold mb-2 tracking-wider uppercase text-gray-300">
                Code d'accès sécurisé
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="w-full pl-10 p-3 bg-black/40 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-red-600 transition-colors"
                  placeholder="••••••••••••"
                  required
                />
              </div>
              {loginError && <p className="text-red-400 text-xs mt-2 font-medium">{loginError}</p>}
            </div>
            <button
              type="submit"
              className="w-full text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-300 shadow-lg hover:opacity-95 text-sm tracking-wider uppercase"
              style={{ backgroundColor: theme.bordeaux }}
            >
              S'authentifier
            </button>
          </form>
          <p className="text-center text-xs text-gray-500 mt-8">
            Authentification requise pour accéder aux dossiers clients et finances.
          </p>
        </div>
      </div>
    );
  }

  const Navigation = () => (
    <div className="w-64 min-h-screen text-white flex flex-col border-r border-gray-800 z-10" style={{ backgroundColor: theme.sidebarBg }}>
      <div className="p-6 border-b border-gray-800/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-red-900/40" style={{ backgroundColor: theme.cardBg }}>
          <Sparkles size={20} style={{ color: theme.accentGold }} />
        </div>
        <div>
          <h1 className="text-lg font-serif font-bold tracking-wide text-white">DEMSY</h1>
          <p className="text-[10px] tracking-widest uppercase text-gray-400">Atelier Haute Couture</p>
        </div>
      </div>
      
      <div className="p-4 mx-3 my-3 rounded-xl bg-black/30 border border-gray-800/60 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-red-900/30 border border-red-800/50 flex items-center justify-center text-red-300 font-bold text-sm">
          AK
        </div>
        <div className="overflow-hidden">
          <p className="text-xs font-bold text-gray-200 truncate">AKANDJI KASIFU</p>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Responsable Atelier</p>
        </div>
      </div>

      <nav className="flex-1 py-2 px-3 space-y-1">
        {[
          { id: 'home', icon: Home, label: 'Tableau de bord' },
          { id: 'analytics', icon: BarChart3, label: 'Rapports & Finances' },
          { id: 'clients', icon: Database, label: 'Base de Données' },
          { id: 'orders', icon: ShoppingBag, label: 'Commandes' },
          { id: 'new-order', icon: Plus, label: 'Nouvelle Commande' },
          { id: 'appointments', icon: Calendar, label: 'Rendez-vous' }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => navigateTo(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
              activeTab === item.id 
                ? 'bg-red-950/40 text-white border border-red-900/40 shadow-sm' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <item.icon size={18} style={{ color: activeTab === item.id ? theme.accentGold : 'inherit' }} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );

  const HomeView = () => (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-serif font-bold text-white tracking-wide">
          Tableau de bord Demsy Couture
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Gérez vos clients, suivez la confection en atelier et analysez vos performances financières.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { id: 'analytics', icon: BarChart3, title: 'FINANCES & RAPPORTS', desc: 'Chiffre d\'affaires et suivi des encaissements' },
          { id: 'clients', icon: Database, title: 'BASE DE DONNÉES', desc: 'Répertoire clients et mensurations détaillées' },
          { id: 'orders', icon: ShoppingBag, title: 'LES COMMANDES', desc: 'Suivi des étapes d\'atelier et statuts de livraison' },
          { id: 'appointments', icon: Calendar, title: 'RENDEZ-VOUS', desc: 'Planning des essayages et permanences' }
        ].map((card) => (
          <div 
            key={card.id}
            onClick={() => navigateTo(card.id)}
            className="rounded-2xl p-6 border border-gray-800 cursor-pointer transition-all duration-300 hover:border-red-900/60 hover:shadow-xl flex flex-col justify-between group relative overflow-hidden"
            style={{ backgroundColor: theme.cardBg }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full blur-2xl group-hover:bg-red-600/10 transition-all"></div>
            <div>
              <div className="w-12 h-12 rounded-xl bg-black/40 border border-gray-800 flex items-center justify-center mb-6 group-hover:border-red-900/50 transition-colors">
                <card.icon size={24} style={{ color: theme.accentGold }} />
              </div>
              <h3 className="text-base font-bold mb-2 text-white tracking-wide">{card.title}</h3>
              <p className="text-gray-400 text-xs leading-relaxed mb-6">{card.desc}</p>
            </div>
            <button 
              className="text-xs font-bold py-2.5 px-4 rounded-xl transition-all text-white w-full flex items-center justify-center gap-2 border border-gray-700/60 group-hover:border-red-800 group-hover:bg-red-950/40"
            >
              Accéder au module
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const BackButton = () => {
    if (activeTab === 'home') return null;
    return (
      <button 
        onClick={goBack} 
        className="mb-6 flex items-center gap-2 text-gray-300 hover:text-white transition-colors font-medium text-xs tracking-wider uppercase bg-black/30 border border-gray-800 px-4 py-2 rounded-xl w-fit"
      >
        <ArrowLeft size={16} /> Retour
      </button>
    );
  };

  const AnalyticsView = () => {
    const totalRevenue = orders.reduce((acc, o) => acc + Number(o.finance?.total || 0), 0);
    const totalCollected = orders.reduce((acc, o) => acc + Number(o.finance?.advance || 0), 0);
    const totalRemaining = orders.reduce((acc, o) => acc + Number(o.finance?.remaining || 0), 0);
    const activeOrdersCount = orders.filter(o => o.status === 'En cours').length;
    const readyOrdersCount = orders.filter(o => o.status === 'Prête').length;

    return (
      <div className="p-8 max-w-7xl mx-auto">
        <BackButton />
        <h2 className="text-2xl font-serif font-bold text-white mb-2">
          Rapports financiers & Performance de l'Atelier
        </h2>
        <p className="text-sm text-gray-400 mb-8">Vue d'ensemble consolidée des flux financiers et de l'activité.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 rounded-2xl border border-gray-800 shadow-lg relative overflow-hidden" style={{ backgroundColor: theme.cardBg }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold tracking-wider text-gray-400 uppercase">CHIFFRE D'AFFAIRES TOTAL</span>
              <div className="p-2 rounded-lg bg-black/40 border border-gray-800"><DollarSign size={20} style={{ color: theme.accentGold }} /></div>
            </div>
            <p className="text-3xl font-black text-white">{totalRevenue.toLocaleString()} <span className="text-sm font-normal text-gray-400">CFA</span></p>
          </div>

          <div className="p-6 rounded-2xl border border-gray-800 shadow-lg relative overflow-hidden" style={{ backgroundColor: theme.cardBg }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold tracking-wider text-gray-400 uppercase">TOTAL ENCAISSÉ (AVANCES)</span>
              <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-900/40"><TrendingUp size={20} className="text-emerald-400" /></div>
            </div>
            <p className="text-3xl font-black text-white">{totalCollected.toLocaleString()} <span className="text-sm font-normal text-gray-400">CFA</span></p>
          </div>

          <div className="p-6 rounded-2xl border border-gray-800 shadow-lg relative overflow-hidden" style={{ backgroundColor: theme.cardBg }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold tracking-wider text-gray-400 uppercase">RESTES À PERCEVOIR</span>
              <div className="p-2 rounded-lg bg-amber-950/30 border border-amber-900/40"><ShoppingBag size={20} className="text-amber-400" /></div>
            </div>
            <p className="text-3xl font-black text-white">{totalRemaining.toLocaleString()} <span className="text-sm font-normal text-gray-400">CFA</span></p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl border border-gray-800 shadow-lg" style={{ backgroundColor: theme.cardBg }}>
            <h3 className="font-bold text-sm tracking-wider uppercase text-white mb-6">État global des commandes</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3.5 bg-black/30 rounded-xl border border-gray-800/80">
                <span className="text-sm text-gray-300">Commandes en cours de confection</span>
                <span className="font-bold text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-lg">{activeOrdersCount}</span>
              </div>
              <div className="flex justify-between items-center p-3.5 bg-black/30 rounded-xl border border-gray-800/80">
                <span className="text-sm text-gray-300">Commandes prêtes pour essayage / livraison</span>
                <span className="font-bold text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-lg">{readyOrdersCount}</span>
              </div>
              <div className="flex justify-between items-center p-3.5 bg-black/30 rounded-xl border border-gray-800/80">
                <span className="text-sm text-gray-300">Nombre total de clients enregistrés</span>
                <span className="font-bold text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-lg">{clients.length}</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-gray-800 shadow-lg flex flex-col justify-between" style={{ backgroundColor: theme.cardBg }}>
            <div>
              <h3 className="font-bold text-sm tracking-wider uppercase text-white mb-2">Activité récente & Productivité</h3>
              <p className="text-gray-400 text-xs leading-relaxed mb-6">L'atelier Demsy Couture maintient un niveau d'excellence et de respect des délais de livraison élevé.</p>
            </div>
            <div className="p-4 bg-black/40 rounded-xl border border-red-900/30 text-center">
              <p className="text-xs font-bold text-red-200">Responsable d'atelier : Akandji Kasifu</p>
              <p className="text-[10px] text-gray-400 mt-1">Synchronisation cloud Firebase temps réel active</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const NewOrderForm = () => {
    const defaultMeasurements = {
      epaule: '', longueur_manche: '', tour_manche: '', poitrine: '', ventre: '', longueur_haut: '', col: '', dos: '',
      ceinture: '', bassin: '', cuisse: '', longueur_bas: '', mollet: '', bas_frappe: ''
    };

    const [formData, setFormData] = useState({
      clientName: '',
      clientContact: '',
      measurements: defaultMeasurements,
      details: '',
      images: [],
      totalPrice: '',
      advance: '',
      remaining: '',
      dueDate: ''
    });
    
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    const handleMeasurementChange = (field, value) => {
      setFormData(prev => ({
        ...prev,
        measurements: { ...prev.measurements, [field]: value }
      }));
    };

    const handleSaveOrder = async () => {
      if (!formData.clientName || !formData.clientContact) {
        setSaveMessage('Erreur : Nom et contact du client obligatoires.');
        return;
      }
      setIsSaving(true);
      setSaveMessage('');

      try {
        let clientId = null;
        const existingClient = clients.find(c => c.contact === formData.clientContact);
        if (existingClient) {
          clientId = existingClient.id;
        }

        const clientData = {
          name: formData.clientName,
          contact: formData.clientContact,
          measurements: formData.measurements,
          lastUpdated: new Date().toISOString()
        };

        if (clientId) {
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'clients', clientId), clientData);
        } else {
          const newClientRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'clients'), clientData);
          clientId = newClientRef.id;
        }

        const orderData = {
          clientId,
          clientName: formData.clientName,
          clientContact: formData.clientContact,
          measurements: formData.measurements,
          details: formData.details,
          images: formData.images,
          finance: {
            total: formData.totalPrice,
            advance: formData.advance,
            remaining: formData.remaining
          },
          dueDate: formData.dueDate,
          status: 'En cours',
          createdAt: new Date().toISOString()
        };

        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'orders'), orderData);
        
        setSaveMessage('Commande et client enregistrés avec succès !');
        setTimeout(() => {
          navigateTo('orders');
        }, 1500);

      } catch (err) {
        console.error("Erreur de sauvegarde:", err);
        setSaveMessage('Erreur lors de la sauvegarde.');
      } finally {
        setIsSaving(false);
      }
    };

    return (
      <div className="p-8 max-w-7xl mx-auto">
        <BackButton />
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-serif font-bold text-white">
              Prise de Nouvelle Commande & Mensurations
            </h2>
            <p className="text-sm text-gray-400 mt-1">Enregistrez les informations client, prises de mesures et détails de confection.</p>
          </div>
          <button 
            onClick={() => navigateTo('orders')}
            className="flex items-center gap-2 text-white px-4 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase border border-gray-700 bg-black/40 hover:bg-black/60 transition-colors"
          >
            <ShoppingBag size={16}/> Liste des commandes
          </button>
        </div>

        {saveMessage && (
          <div className={`p-4 mb-6 rounded-xl text-xs font-bold tracking-wider ${saveMessage.includes('Erreur') ? 'bg-red-950/60 border border-red-900 text-red-300' : 'bg-emerald-950/60 border border-emerald-900 text-emerald-300'}`}>
            {saveMessage}
          </div>
        )}

        <div className="rounded-2xl border border-gray-800 p-6 mb-6 shadow-lg" style={{ backgroundColor: theme.cardBg }}>
          <h3 className="text-sm font-bold mb-4 tracking-wider uppercase text-white flex items-center gap-2">
            <span className="bg-red-900/60 text-red-200 border border-red-800 px-2 py-0.5 rounded text-[10px]">01</span> INFORMATION CLIENT
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Nom Complet:</label>
              <input 
                type="text" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})}
                className="w-full bg-black/40 border border-gray-700 p-3 rounded-xl text-white focus:outline-none focus:border-red-600 text-sm"
                placeholder="Ex: Marie Dupuis"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Numéro de Contact:</label>
              <input 
                type="text" value={formData.clientContact} onChange={e => setFormData({...formData, clientContact: e.target.value})}
                className="w-full bg-black/40 border border-gray-700 p-3 rounded-xl text-white focus:outline-none focus:border-red-600 text-sm"
                placeholder="+225 00 00 00 00 00"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-800 p-6 mb-6 shadow-lg" style={{ backgroundColor: theme.cardBg }}>
          <h3 className="text-sm font-bold mb-4 tracking-wider uppercase text-white flex items-center gap-2">
            <span className="bg-red-900/60 text-red-200 border border-red-800 px-2 py-0.5 rounded text-[10px]">02</span> MESURES (en cm)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-black/30 p-5 rounded-xl border border-gray-800/80">
              <h4 className="font-bold text-xs tracking-wider uppercase text-gray-300 mb-4 pb-2 border-b border-gray-800">MESURES DU HAUT</h4>
              <div className="grid grid-cols-2 gap-4">
                {['Epaule', 'Longueur_manche', 'Tour_manche', 'Poitrine', 'Ventre', 'Longueur_haut', 'Col', 'Dos'].map(m => (
                  <div key={m} className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-400 capitalize">{m.replace('_', ' ')}:</label>
                    <input 
                      type="number" value={formData.measurements[m.toLowerCase()] || ''} 
                      onChange={e => handleMeasurementChange(m.toLowerCase(), e.target.value)}
                      className="w-20 bg-black/50 border border-gray-700 p-2 rounded-lg text-white text-center text-sm focus:outline-none focus:border-red-600"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-black/30 p-5 rounded-xl border border-gray-800/80">
              <h4 className="font-bold text-xs tracking-wider uppercase text-gray-300 mb-4 pb-2 border-b border-gray-800">MESURES DU BAS</h4>
              <div className="grid grid-cols-2 gap-4">
                {['Ceinture', 'Bassin', 'Cuisse', 'Longueur_bas', 'Mollet', 'Bas_frappe'].map(m => (
                  <div key={m} className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-400 capitalize">{m.replace('_', ' ')}:</label>
                    <input 
                      type="number" value={formData.measurements[m.toLowerCase()] || ''} 
                      onChange={e => handleMeasurementChange(m.toLowerCase(), e.target.value)}
                      className="w-20 bg-black/50 border border-gray-700 p-2 rounded-lg text-white text-center text-sm focus:outline-none focus:border-red-600"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-800 p-6 mb-6 shadow-lg" style={{ backgroundColor: theme.cardBg }}>
          <h3 className="text-sm font-bold mb-4 tracking-wider uppercase text-white flex items-center gap-2">
            <span className="bg-red-900/60 text-red-200 border border-red-800 px-2 py-0.5 rounded text-[10px]">03</span> COMMANDE & SPÉCIFICATIONS
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-2">
              <textarea 
                value={formData.details} onChange={e => setFormData({...formData, details: e.target.value})}
                className="w-full h-36 bg-black/40 border border-gray-700 p-4 rounded-xl text-white focus:outline-none focus:border-red-600 text-sm"
                placeholder="Détails du modèle, type de tissu, broderies, finitions particulières..."
              />
              <div className="mt-4 flex gap-4 items-center">
                <button type="button" className="flex items-center gap-2 bg-black/40 border border-gray-700 text-gray-300 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-black/60">
                  <Mic size={16} /> Enregistrement Vocal (Simulation)
                </button>
              </div>
            </div>
            
            <div className="border border-dashed border-gray-700 rounded-xl flex flex-col p-4 bg-black/20">
              <div className="flex items-center justify-between mb-3 border-b border-gray-800 pb-2">
                <p className="text-xs font-bold text-gray-300 uppercase">Images de modèles</p>
                <label className="text-white text-[11px] font-bold px-3 py-1.5 rounded-lg cursor-pointer hover:opacity-90 flex items-center gap-1.5 border border-red-800" style={{ backgroundColor: theme.bordeaux }}>
                  <Plus size={14}/> Ajouter
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      files.forEach(file => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setFormData(prev => ({ ...prev, images: [...prev.images, reader.result] }));
                        };
                        reader.readAsDataURL(file);
                      });
                    }}
                  />
                </label>
              </div>
              
              {formData.images.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 py-6">
                  <ImageIcon size={28} className="mb-2" />
                  <span className="text-xs text-center">Aucune image sélectionnée</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 overflow-y-auto max-h-36 pr-1">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="relative group rounded-lg overflow-hidden border border-gray-700">
                      <img src={img} alt={`Modèle ${idx + 1}`} className="w-full h-16 object-cover" />
                      <button 
                        onClick={() => setFormData(prev => ({...prev, images: prev.images.filter((_, i) => i !== idx)}))}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-800 p-6 mb-6 shadow-lg" style={{ backgroundColor: theme.cardBg }}>
           <h3 className="text-sm font-bold mb-4 tracking-wider uppercase text-white">FINANCES & ÉCHÉANCE</h3>
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             <div>
               <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Prix Total (CFA):</label>
               <input type="number" value={formData.totalPrice} onChange={e => setFormData({...formData, totalPrice: e.target.value})} className="w-full bg-black/40 border border-gray-700 p-3 rounded-xl text-white text-sm" />
             </div>
             <div>
               <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Avance (CFA):</label>
               <input type="number" value={formData.advance} onChange={e => {
                 const adv = e.target.value;
                 const rem = formData.totalPrice ? Number(formData.totalPrice) - Number(adv) : '';
                 setFormData({...formData, advance: adv, remaining: rem});
               }} className="w-full bg-black/40 border border-gray-700 p-3 rounded-xl text-white text-sm" />
             </div>
             <div>
               <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Reste à Payer:</label>
               <input type="number" value={formData.remaining} readOnly className="w-full bg-black/60 border border-gray-800 p-3 rounded-xl text-gray-400 text-sm" />
             </div>
             <div>
               <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Date de RDV / Livraison:</label>
               <input type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} className="w-full bg-black/40 border border-gray-700 p-3 rounded-xl text-white text-sm" />
             </div>
           </div>
        </div>

        <button 
          onClick={handleSaveOrder} disabled={isSaving}
          className="w-full text-white font-bold py-4 rounded-xl text-sm tracking-widest uppercase shadow-xl hover:opacity-95 transition-opacity flex justify-center items-center gap-2 border border-red-800"
          style={{ backgroundColor: theme.bordeaux }}
        >
          <Save size={20} /> {isSaving ? 'Enregistrement en cours...' : 'ENREGISTRER LA COMMANDE'}
        </button>
      </div>
    );
  };

  const OrdersView = () => {
    const sortedOrders = [...orders].sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });

    const getStatusColor = (status) => {
      switch(status) {
        case 'Prête': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
        case 'En attente': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
        case 'Livrée': return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
        default: return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      }
    };

    const handleDelete = async (id) => {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', id));
      } catch (err) {
        console.error("Erreur de suppression:", err);
      }
    };

    return (
      <div className="p-8 max-w-7xl mx-auto">
        <BackButton />
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-serif font-bold text-white">Gestion des Commandes Atelier</h2>
            <p className="text-sm text-gray-400 mt-1">Suivi des statuts, essayages et livraisons.</p>
          </div>
          <button 
            onClick={() => navigateTo('new-order')}
            className="flex items-center gap-2 text-white px-4 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase border border-red-800 shadow-lg"
            style={{ backgroundColor: theme.bordeaux }}
          >
            <Plus size={16}/> Nouvelle Commande
          </button>
        </div>

        {sortedOrders.length === 0 ? (
          <div className="rounded-2xl border border-gray-800 p-12 text-center text-gray-400" style={{ backgroundColor: theme.cardBg }}>
            <ShoppingBag size={40} className="mx-auto mb-4 opacity-40" style={{ color: theme.accentGold }} />
            <p className="text-sm font-medium">Aucune commande enregistrée pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {sortedOrders.map(order => (
              <div key={order.id} className="rounded-2xl border border-gray-800 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg" style={{ backgroundColor: theme.cardBg }}>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-white text-base">{order.clientName}</h3>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${getStatusColor(order.status)}`}>{order.status || 'En cours'}</span>
                  </div>
                  <p className="text-xs text-gray-400">Contact : {order.clientContact}</p>
                  <p className="text-xs text-gray-400 mt-1">Date de RDV / Livraison : <span className="text-white font-medium">{order.dueDate || 'Non définie'}</span></p>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                  <div className="text-right">
                    <p className="text-sm font-black text-white">{Number(order.finance?.total || 0).toLocaleString()} <span className="text-xs font-normal text-gray-400">CFA</span></p>
                    <p className="text-[10px] text-amber-400">Reste : {Number(order.finance?.remaining || 0).toLocaleString()} CFA</p>
                  </div>
                  <button 
                    onClick={() => handleDelete(order.id)}
                    className="p-2 rounded-xl bg-red-950/30 border border-red-900/40 text-red-400 hover:bg-red-900/40 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const ClientsView = () => (
    <div className="p-8 max-w-7xl mx-auto">
      <BackButton />
      <h2 className="text-2xl font-serif font-bold text-white mb-2">Base de Données Clients & Mensurations</h2>
      <p className="text-sm text-gray-400 mb-6">Répertoire centralisé des mensurations enregistrées en atelier.</p>
      
      {clients.length === 0 ? (
        <div className="rounded-2xl border border-gray-800 p-12 text-center text-gray-400" style={{ backgroundColor: theme.cardBg }}>
          <Database size={40} className="mx-auto mb-4 opacity-40" style={{ color: theme.accentGold }} />
          <p className="text-sm font-medium">Aucun client enregistré pour l'instant.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {clients.map(client => (
            <div key={client.id} className="rounded-2xl border border-gray-800 p-6 shadow-lg" style={{ backgroundColor: theme.cardBg }}>
              <div className="flex justify-between items-start mb-4 pb-3 border-b border-gray-800">
                <div>
                  <h3 className="font-bold text-white text-base">{client.name}</h3>
                  <p className="text-xs text-gray-400">{client.contact}</p>
                </div>
                <span className="text-[10px] bg-black/40 border border-gray-700 text-gray-300 px-2.5 py-1 rounded-lg">ID Client</span>
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Dernières mensurations (cm)</h4>
              <div className="grid grid-cols-3 gap-2 bg-black/30 p-3 rounded-xl border border-gray-800/80">
                {client.measurements && Object.entries(client.measurements).map(([k, v]) => (
                  <div key={k} className="text-center p-1.5 bg-black/40 rounded-lg border border-gray-800">
                    <span className="block text-[10px] uppercase text-gray-400 truncate">{k}</span>
                    <span className="text-xs font-bold text-white">{v || '-'}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const AppointmentsView = () => (
    <div className="p-8 max-w-7xl mx-auto">
      <BackButton />
      <h2 className="text-2xl font-serif font-bold text-white mb-2">Planning des Rendez-vous & Essayages</h2>
      <p className="text-sm text-gray-400 mb-6">Gestion des permanences et des agendas de l'atelier.</p>
      <div className="rounded-2xl border border-gray-800 p-12 text-center text-gray-400" style={{ backgroundColor: theme.cardBg }}>
        <Calendar size={40} className="mx-auto mb-4 opacity-40" style={{ color: theme.accentGold }} />
        <p className="text-sm font-medium">Le planning des essayages est synchronisé avec les dates de livraison des commandes.</p>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: theme.bg, color: theme.text }}>
      <Navigation />
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'home' && <HomeView />}
        {activeTab === 'analytics' && <AnalyticsView />}
        {activeTab === 'clients' && <ClientsView />}
        {activeTab === 'orders' && <OrdersView />}
        {activeTab === 'new-order' && <NewOrderForm />}
        {activeTab === 'appointments' && <AppointmentsView />}
      </main>
    </div>
  );
}
