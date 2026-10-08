import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, collection, onSnapshot, doc, setDoc, addDoc, deleteDoc, updateDoc
} from 'firebase/firestore';
import { 
  Lock, Home, Database, ShoppingBag, Calendar, User, 
  Search, Plus, Eye, Edit, Trash2, Mic, Image as ImageIcon, Save, ArrowLeft, X
} from 'lucide-react';

// --- Firebase Configuration & Initialization ---
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'demsy-couture-app';

// Theme Colors
const theme = {
  bg: '#FFFDD0',
  bordeaux: '#800020',
  bordeauxHover: '#5e0017',
  text: '#333333'
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

  // Data States
  const [clients, setClients] = useState([]);
  const [orders, setOrders] = useState([]);
  const [appointments, setAppointments] = useState([]);

  // Init Firebase Auth
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

  // Fetch Data when authenticated
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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.bg }}>
        <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full border-t-8" style={{ borderColor: theme.bordeaux }}>
          <div className="text-center mb-8">
            <h1 className="text-4xl font-serif font-bold mb-2" style={{ color: theme.bordeaux }}>DEMSY COUTURE</h1>
            <p className="text-gray-600 font-medium">AUTHENTIFICATION DU PERSONNEL</p>
            <p className="text-sm text-gray-500 mt-1">- ACCÈS RÉSERVÉ -</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="flex justify-center mb-4">
              <Lock size={48} style={{ color: theme.bordeaux }} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: theme.bordeaux }}>
                CODE D'ACCÈS
              </label>
              <input
                type="password"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2"
                style={{ focusRing: theme.bordeaux }}
                placeholder="Ex: ******"
                required
              />
              {loginError && <p className="text-red-600 text-sm mt-2">{loginError}</p>}
            </div>
            <button
              type="submit"
              className="w-full text-white font-bold py-3 px-4 rounded transition duration-300"
              style={{ backgroundColor: theme.bordeaux }}
              onMouseOver={(e) => e.target.style.backgroundColor = theme.bordeauxHover}
              onMouseOut={(e) => e.target.style.backgroundColor = theme.bordeaux}
            >
              S'AUTHENTIFIER
            </button>
          </form>
          <p className="text-center text-xs text-gray-500 mt-6">
            Pour tout problème d'accès, contactez l'administration.
          </p>
        </div>
      </div>
    );
  }

  const Navigation = () => (
    <div className="w-64 min-h-screen text-white flex flex-col shadow-xl z-10" style={{ backgroundColor: theme.bordeaux }}>
      <div className="p-6 text-center border-b border-red-800">
        <h1 className="text-3xl font-serif font-bold mb-1" style={{ color: theme.bg }}>DEMSY</h1>
        <h2 className="text-xl font-serif tracking-widest" style={{ color: theme.bg }}>COUTURE</h2>
      </div>
      
      <div className="p-4 flex items-center gap-3 bg-black/20 border-b border-red-800">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
          <User style={{ color: theme.bordeaux }} size={20} />
        </div>
        <div>
          <p className="text-sm font-bold">AKANDJI KASIFU</p>
          <p className="text-xs text-red-200">Responsable</p>
        </div>
      </div>

      <nav className="flex-1 py-4">
        {[
          { id: 'home', icon: Home, label: 'Tableau de bord' },
          { id: 'clients', icon: Database, label: 'Base de Données' },
          { id: 'orders', icon: ShoppingBag, label: 'Commandes' },
          { id: 'new-order', icon: Plus, label: 'Nouvelle Commande' },
          { id: 'appointments', icon: Calendar, label: 'Rendez-vous' }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => navigateTo(item.id)}
            className={`w-full flex items-center gap-4 px-6 py-4 transition-colors ${
              activeTab === item.id ? 'bg-black/30 border-l-4' : 'hover:bg-black/10'
            }`}
            style={{ borderColor: activeTab === item.id ? theme.bg : 'transparent' }}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );

  const HomeView = () => (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-8 uppercase" style={{ color: theme.bordeaux }}>
        BIENVENUE CHEZ DEMSY COUTURE - OUTIL DE TRAVAIL INTERNE
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { id: 'clients', icon: Database, title: 'BASE DE DONNÉES', desc: 'Clients, Produits, Collections' },
          { id: 'orders', icon: ShoppingBag, title: 'LES COMMANDES', desc: 'Suivi, En cours, Historique' },
          { id: 'appointments', icon: Calendar, title: 'RENDEZ-VOUS', desc: 'Planning, Clients, Essayages' }
        ].map((card) => (
          <div 
            key={card.id}
            onClick={() => navigateTo(card.id)}
            className="rounded-2xl p-8 border-4 cursor-pointer transform hover:scale-105 transition-all shadow-lg flex flex-col items-center text-center group"
            style={{ borderColor: theme.bordeaux, backgroundColor: 'white' }}
          >
            <card.icon size={80} style={{ color: theme.bordeaux }} className="mb-6 group-hover:animate-bounce" />
            <h3 className="text-2xl font-bold mb-2" style={{ color: theme.bordeaux }}>{card.title}</h3>
            <p className="text-gray-600 mb-6">{card.desc}</p>
            <button 
              className="text-white font-bold py-2 px-8 rounded-full transition duration-300"
              style={{ backgroundColor: theme.bordeaux }}
            >
              ACCÉDER
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
        className="mb-6 flex items-center gap-2 text-gray-700 hover:text-red-900 transition-colors font-bold w-fit bg-gray-200 px-4 py-2 rounded-lg"
      >
        <ArrowLeft size={20} /> Retour
      </button>
    );
  };

  const NewOrderForm = ({ prefilledClient = null }) => {
    const defaultMeasurements = {
      epaule: '', longueur_manche: '', tour_manche: '', poitrine: '', ventre: '', longueur_haut: '', col: '', dos: '',
      ceinture: '', bassin: '', cuisse: '', longueur_bas: '', mollet: '', bas_frappe: ''
    };

    const [formData, setFormData] = useState({
      clientName: prefilledClient?.name || '',
      clientContact: prefilledClient?.contact || '',
      measurements: prefilledClient?.measurements || defaultMeasurements,
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
        // 1. Chercher si le client existe (par contact)
        let clientId = prefilledClient?.id;
        if (!clientId) {
          const existingClient = clients.find(c => c.contact === formData.clientContact);
          if (existingClient) {
            clientId = existingClient.id;
          }
        }

        const clientData = {
          name: formData.clientName,
          contact: formData.clientContact,
          measurements: formData.measurements,
          lastUpdated: new Date().toISOString()
        };

        // 2. Créer ou Mettre à jour le client
        if (clientId) {
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'clients', clientId), clientData);
        } else {
          const newClientRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'clients'), clientData);
          clientId = newClientRef.id;
        }

        // 3. Créer la commande
        const orderData = {
          clientId,
          clientName: formData.clientName,
          clientContact: formData.clientContact,
          measurements: formData.measurements, // Snapshot des mesures pour cette commande
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
      <div className="p-8 max-w-6xl mx-auto">
        <BackButton />
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold uppercase" style={{ color: theme.bordeaux }}>
            Prise de Nouvelle Commande & Mesures
          </h2>
          <button 
            onClick={() => navigateTo('orders')}
            className="flex items-center gap-2 text-white px-4 py-2 rounded font-bold hover:opacity-90 transition-opacity"
            style={{ backgroundColor: theme.bordeaux }}
          >
            <ShoppingBag size={18}/> Liste des commandes
          </button>
        </div>

        {saveMessage && (
          <div className={`p-4 mb-6 rounded font-bold ${saveMessage.includes('Erreur') ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}>
            {saveMessage}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg border border-red-200 p-6 mb-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: theme.bordeaux }}>
            <span className="bg-red-900 text-white px-2 py-1 rounded text-sm">1er</span> INFORMATION CLIENT
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Nom Complet:</label>
              <input 
                type="text" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})}
                className="w-full border-2 p-2 rounded focus:outline-none" style={{ borderColor: theme.bordeaux }}
                placeholder="Ex: Marie Dupuis"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Numéro de Contact:</label>
              <input 
                type="text" value={formData.clientContact} onChange={e => setFormData({...formData, clientContact: e.target.value})}
                className="w-full border-2 p-2 rounded focus:outline-none" style={{ borderColor: theme.bordeaux }}
                placeholder="+225 00 00 00 00 00"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-red-200 p-6 mb-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: theme.bordeaux }}>
            <span className="bg-red-900 text-white px-2 py-1 rounded text-sm">2ème</span> MESURES (en cm)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* HAUT */}
            <div className="bg-gray-50 p-4 rounded border border-gray-200">
              <h4 className="font-bold text-center mb-4" style={{ color: theme.bordeaux }}>MESURES DU HAUT</h4>
              <div className="grid grid-cols-2 gap-4">
                {['Epaule', 'Longueur_manche', 'Tour_manche', 'Poitrine', 'Ventre', 'Longueur_haut', 'Col', 'Dos'].map(m => (
                  <div key={m} className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 capitalize">{m.replace('_', ' ')}:</label>
                    <input 
                      type="number" value={formData.measurements[m.toLowerCase()] || ''} 
                      onChange={e => handleMeasurementChange(m.toLowerCase(), e.target.value)}
                      className="w-20 border border-gray-400 p-1 rounded text-center"
                    />
                  </div>
                ))}
              </div>
            </div>
            {/* BAS */}
            <div className="bg-gray-50 p-4 rounded border border-gray-200">
              <h4 className="font-bold text-center mb-4" style={{ color: theme.bordeaux }}>MESURES DU BAS</h4>
              <div className="grid grid-cols-2 gap-4">
                {['Ceinture', 'Bassin', 'Cuisse', 'Longueur_bas', 'Mollet', 'Bas_frappe'].map(m => (
                  <div key={m} className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 capitalize">{m.replace('_', ' ')}:</label>
                    <input 
                      type="number" value={formData.measurements[m.toLowerCase()] || ''} 
                      onChange={e => handleMeasurementChange(m.toLowerCase(), e.target.value)}
                      className="w-20 border border-gray-400 p-1 rounded text-center"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-red-200 p-6 mb-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: theme.bordeaux }}>
            <span className="bg-red-900 text-white px-2 py-1 rounded text-sm">3ème</span> COMMANDE & SPÉCIFICATIONS
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-2">
              <textarea 
                value={formData.details} onChange={e => setFormData({...formData, details: e.target.value})}
                className="w-full h-32 border-2 p-3 rounded focus:outline-none" style={{ borderColor: theme.bordeaux }}
                placeholder="Saisissez les détails de la commande, tissus, style, broderies, etc..."
              />
              <div className="mt-4 flex gap-4">
                <button className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">
                  <Mic size={18} /> Enregistrement Vocal (Simulation)
                </button>
                <div className="flex-1 flex items-center">
                  <div className="h-2 bg-gray-300 w-full rounded-full overflow-hidden">
                    <div className="w-0 h-full bg-red-900"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-2 border-dashed rounded flex flex-col p-4 bg-gray-50" style={{ borderColor: theme.bordeaux }}>
              <div className="flex items-center justify-between mb-3 border-b pb-2">
                <p className="text-sm font-bold text-gray-700">Images de modèles</p>
                <label className="text-white text-xs px-3 py-1.5 rounded cursor-pointer hover:opacity-90 flex items-center gap-1" style={{ backgroundColor: theme.bordeaux }}>
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
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-4">
                  <ImageIcon size={32} className="mb-2" />
                  <span className="text-xs text-center">Aucune image sélectionnée</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 overflow-y-auto max-h-36 pr-1">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="relative group rounded overflow-hidden border border-gray-300">
                      <img src={img} alt={`Modèle ${idx + 1}`} className="w-full h-16 object-cover" />
                      <button 
                        onClick={() => setFormData(prev => ({...prev, images: prev.images.filter((_, i) => i !== idx)}))}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Retirer"
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

        <div className="bg-white rounded-xl shadow-lg border border-red-200 p-6 mb-6">
           <h3 className="text-lg font-bold mb-4" style={{ color: theme.bordeaux }}>FINANCES & ÉCHÉANCE</h3>
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             <div>
               <label className="block text-sm font-bold text-gray-700 mb-1">Prix Total (CFA):</label>
               <input type="number" value={formData.totalPrice} onChange={e => setFormData({...formData, totalPrice: e.target.value})} className="w-full border-2 p-2 rounded" style={{ borderColor: theme.bordeaux }} />
             </div>
             <div>
               <label className="block text-sm font-bold text-gray-700 mb-1">Avance (CFA):</label>
               <input type="number" value={formData.advance} onChange={e => {
                 const adv = e.target.value;
                 const rem = formData.totalPrice ? Number(formData.totalPrice) - Number(adv) : '';
                 setFormData({...formData, advance: adv, remaining: rem});
               }} className="w-full border-2 p-2 rounded" style={{ borderColor: theme.bordeaux }} />
             </div>
             <div>
               <label className="block text-sm font-bold text-gray-700 mb-1">Reste à Payer:</label>
               <input type="number" value={formData.remaining} readOnly className="w-full border-2 p-2 rounded bg-gray-100" style={{ borderColor: theme.bordeaux }} />
             </div>
             <div>
               <label className="block text-sm font-bold text-gray-700 mb-1">Date du RDV / Livraison:</label>
               <input type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} className="w-full border-2 p-2 rounded" style={{ borderColor: theme.bordeaux }} />
             </div>
           </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={handleSaveOrder} disabled={isSaving}
            className="flex-1 text-white font-bold py-4 rounded text-xl shadow-lg hover:opacity-90 transition-opacity flex justify-center items-center gap-2"
            style={{ backgroundColor: theme.bordeaux }}
          >
            <Save size={24} /> {isSaving ? 'Enregistrement...' : 'ENREGISTRER LA COMMANDE'}
          </button>
        </div>
      </div>
    );
  };

  const OrdersView = () => {
    // Trier par date la plus proche
    const sortedOrders = [...orders].sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });

    const getStatusColor = (status) => {
      switch(status) {
        case 'Prête': return 'bg-green-200 text-green-800';
        case 'En attente': return 'bg-yellow-200 text-yellow-800';
        case 'Livrée': return 'bg-gray-300 text-gray-800';
        default: return 'bg-orange-200 text-orange-800'; // En cours
      }
    };

    const handleDelete = async (id) => {
      // Pas de confirm() native, on supprime directement ou on pourrait faire un modal custom. Pour simplifier:
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', id));
      } catch (e) {
        console.error("Erreur supression", e);
      }
    };

    const handleUpdateStatus = async (id, newStatus) => {
      try {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', id), { status: newStatus });
      } catch(e) { console.error(e); }
    };

    return (
      <div className="p-8 max-w-6xl mx-auto">
        <BackButton />
        <div className="flex justify-between items-center mb-8 border-b-2 pb-4" style={{ borderColor: theme.bordeaux }}>
          <h2 className="text-2xl font-bold uppercase" style={{ color: theme.bordeaux }}>
            Liste des Commandes et États d'Avancement
          </h2>
          <button 
            onClick={() => navigateTo('new-order')}
            className="flex items-center gap-2 text-white px-4 py-2 rounded font-bold hover:opacity-90"
            style={{ backgroundColor: theme.bordeaux }}
          >
            <Plus size={18}/> NOUVELLE COMMANDE
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden border" style={{ borderColor: theme.bordeaux }}>
          <table className="w-full text-left">
            <thead style={{ backgroundColor: theme.bg, color: theme.bordeaux }}>
              <tr>
                <th className="p-4 font-bold">CLIENT</th>
                <th className="p-4 font-bold">DATE PRÉVUE</th>
                <th className="p-4 font-bold">FINANCE (Reste)</th>
                <th className="p-4 font-bold">ÉTAT</th>
                <th className="p-4 font-bold text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {sortedOrders.map((order, idx) => (
                <tr key={order.id} className={`border-b ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="p-4">
                    <p className="font-bold text-gray-800">{order.clientName}</p>
                    <p className="text-sm text-gray-500">{order.clientContact}</p>
                  </td>
                  <td className="p-4 font-medium text-gray-700">
                    {order.dueDate ? new Date(order.dueDate).toLocaleDateString() : 'Non définie'}
                  </td>
                  <td className="p-4">
                    {order.finance?.remaining ? `${order.finance.remaining} CFA` : 'Soldé'}
                  </td>
                  <td className="p-4">
                    <select 
                      value={order.status}
                      onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                      className={`px-3 py-1 rounded-full text-sm font-bold border-none outline-none cursor-pointer ${getStatusColor(order.status)}`}
                    >
                      <option value="En cours">En cours</option>
                      <option value="Prête">Prête</option>
                      <option value="En attente">En attente</option>
                      <option value="Livrée">Livrée</option>
                    </select>
                  </td>
                  <td className="p-4 flex justify-center gap-3">
                    <button className="text-blue-600 hover:text-blue-800" title="Voir les détails">
                      <Eye size={20} />
                    </button>
                    <button onClick={() => handleDelete(order.id)} className="text-red-600 hover:text-red-800" title="Supprimer">
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
              {sortedOrders.length === 0 && (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">Aucune commande trouvée.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const ClientsView = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClient, setSelectedClient] = useState(null);

    const filteredClients = clients.filter(c => 
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.contact?.includes(searchTerm)
    );

    return (
      <div className="p-8 max-w-7xl mx-auto flex flex-col h-[calc(100vh-4rem)]">
        <BackButton />
        <div className="flex gap-6 flex-1 min-h-0">
          {}
          <div className="w-2/3 flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold uppercase" style={{ color: theme.bordeaux }}>
                Base de Données Clients
              </h2>
            </div>
            
            <div className="relative mb-6">
              <input 
                type="text" 
                placeholder="Rechercher un client par nom ou contact..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-full border-2 focus:outline-none"
                style={{ borderColor: theme.bordeaux }}
              />
            </div>

          <div className="flex-1 overflow-y-auto pr-2">
            {filteredClients.map((client) => (
              <div 
                key={client.id}
                onClick={() => setSelectedClient(client)}
                className={`p-4 mb-3 rounded-xl border-2 cursor-pointer transition-colors flex justify-between items-center ${
                  selectedClient?.id === client.id ? 'bg-red-50' : 'bg-white hover:bg-gray-50'
                }`}
                style={{ borderColor: selectedClient?.id === client.id ? theme.bordeaux : '#e5e7eb' }}
              >
                <div>
                  <h4 className="font-bold text-lg" style={{ color: theme.bordeaux }}>{client.name}</h4>
                  <p className="text-gray-600">{client.contact}</p>
                </div>
                <div className="text-sm text-gray-400 flex items-center gap-2">
                  <Eye size={16} /> Voir fiche
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Détails du client */}
        <div className="w-1/3">
          {selectedClient ? (
            <div className="bg-white rounded-xl shadow-2xl border-t-8 h-full flex flex-col" style={{ borderColor: theme.bordeaux }}>
              <div className="p-6 border-b bg-gray-50">
                <h3 className="text-xl font-bold mb-1" style={{ color: theme.bordeaux }}>{selectedClient.name}</h3>
                <p className="text-gray-600">{selectedClient.contact}</p>
              </div>
              
              <div className="p-6 flex-1 overflow-y-auto">
                <h4 className="font-bold text-sm text-gray-500 mb-4 uppercase">Mesures Enregistrées</h4>
                <div className="space-y-4">
                  <div>
                    <h5 className="font-bold text-red-900 border-b border-red-100 mb-2 pb-1">Haut</h5>
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      {['epaule', 'longueur_manche', 'tour_manche', 'poitrine', 'ventre', 'longueur_haut', 'col', 'dos'].map(m => (
                        <div key={m} className="flex justify-between pr-4">
                          <span className="text-gray-600 capitalize">{m.replace('_', ' ')}:</span>
                          <span className="font-medium">{selectedClient.measurements?.[m] || '-'} cm</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="font-bold text-red-900 border-b border-red-100 mb-2 pb-1 mt-4">Bas</h5>
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      {['ceinture', 'bassin', 'cuisse', 'longueur_bas', 'mollet', 'bas_frappe'].map(m => (
                        <div key={m} className="flex justify-between pr-4">
                          <span className="text-gray-600 capitalize">{m.replace('_', ' ')}:</span>
                          <span className="font-medium">{selectedClient.measurements?.[m] || '-'} cm</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t bg-gray-50 space-y-3">
                <button 
                  className="w-full text-white font-bold py-2 rounded flex justify-center items-center gap-2 hover:opacity-90"
                  style={{ backgroundColor: theme.bordeaux }}
                  onClick={() => {
                    alert("Pour créer une commande avec ce client, allez sur Nouvelle Commande. (Fonctionnalité de pré-remplissage à lier)");
                    navigateTo('new-order');
                  }}
                >
                  <ShoppingBag size={18} /> NOUVELLE COMMANDE
                </button>
                <button className="w-full bg-white text-gray-800 border-2 border-gray-300 font-bold py-2 rounded hover:bg-gray-100">
                  MODIFIER LES INFORMATIONS
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center p-8 text-center text-gray-400">
              <p>Sélectionnez un client dans la liste pour voir ses informations et mesures.</p>
            </div>
          )}
        </div>
        </div>
      </div>
    );
  };

  const AppointmentsView = () => {
    const [newApt, setNewApt] = useState({ date: '', time: '', clientName: '', purpose: '' });

    const handleAddAppointment = async (e) => {
      e.preventDefault();
      if(!newApt.date || !newApt.clientName) return;
      try {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'appointments'), {
          ...newApt,
          status: 'Confirmé',
          createdAt: new Date().toISOString()
        });
        setNewApt({ date: '', time: '', clientName: '', purpose: '' });
      } catch (err) { console.error(err); }
    };

    // Sort by date/time
    const sortedApts = [...appointments].sort((a, b) => new Date(`${a.date}T${a.time||'00:00'}`) - new Date(`${b.date}T${b.time||'00:00'}`));

    return (
      <div className="p-8 max-w-5xl mx-auto">
        <BackButton />
        <h2 className="text-2xl font-bold uppercase mb-8" style={{ color: theme.bordeaux }}>
          Planification des Rendez-vous
        </h2>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-red-100 mb-8">
          <h3 className="font-bold mb-4" style={{ color: theme.bordeaux }}>Ajouter un Rendez-vous</h3>
          <form onSubmit={handleAddAppointment} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-600 mb-1">Date</label>
              <input type="date" required value={newApt.date} onChange={e=>setNewApt({...newApt, date: e.target.value})} className="w-full p-2 border rounded" />
            </div>
            <div className="w-32">
              <label className="block text-xs font-bold text-gray-600 mb-1">Heure</label>
              <input type="time" value={newApt.time} onChange={e=>setNewApt({...newApt, time: e.target.value})} className="w-full p-2 border rounded" />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-600 mb-1">Client</label>
              <input type="text" required placeholder="Nom du client" value={newApt.clientName} onChange={e=>setNewApt({...newApt, clientName: e.target.value})} className="w-full p-2 border rounded" />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-600 mb-1">Objet</label>
              <input type="text" placeholder="Ex: Prise de mesure, Essai..." value={newApt.purpose} onChange={e=>setNewApt({...newApt, purpose: e.target.value})} className="w-full p-2 border rounded" />
            </div>
            <button type="submit" className="p-2 text-white rounded font-bold px-6" style={{ backgroundColor: theme.bordeaux }}>
              Ajouter
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden border" style={{ borderColor: theme.bordeaux }}>
          <table className="w-full text-left">
            <thead style={{ backgroundColor: theme.bg, color: theme.bordeaux }}>
              <tr>
                <th className="p-4 font-bold">DATE & HEURE</th>
                <th className="p-4 font-bold">CLIENT</th>
                <th className="p-4 font-bold">OBJET</th>
                <th className="p-4 font-bold">STATUT</th>
              </tr>
            </thead>
            <tbody>
              {sortedApts.map((apt, idx) => (
                <tr key={apt.id} className={`border-b ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="p-4 font-medium">
                    {new Date(apt.date).toLocaleDateString()} à {apt.time || '--:--'}
                  </td>
                  <td className="p-4 font-bold">{apt.clientName}</td>
                  <td className="p-4 text-gray-600">{apt.purpose}</td>
                  <td className="p-4">
                    <span className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                      {apt.status}
                    </span>
                  </td>
                </tr>
              ))}
              {sortedApts.length === 0 && (
                <tr><td colSpan="4" className="p-8 text-center text-gray-500">Aucun rendez-vous prévu.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: theme.bg }}>
      <Navigation />
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'home' && <HomeView />}
        {activeTab === 'new-order' && <NewOrderForm />}
        {activeTab === 'orders' && <OrdersView />}
        {activeTab === 'clients' && <ClientsView />}
        {activeTab === 'appointments' && <AppointmentsView />}
      </main>
    </div>
  );
}
