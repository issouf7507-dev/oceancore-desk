import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Fuel, 
  Bus, 
  Users, 
  AlertTriangle, 
  Settings, 
  Search, 
  Calendar, 
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  MapPin,
  ChevronRight
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  Legend,
  ComposedChart
} from 'recharts';

// Données simulées basées sur l'échantillon Excel fourni
const rawData = [
  { date: '01 Fév', litres: 95, distance: 806, conso: 32.1, theo: 28.5, gps: 798, driver: 'Ouattara B.', vehicle: '3609LE01', status: 'Normal' },
  { date: '02 Fév', litres: 88, distance: 842, conso: 34.5, theo: 28.5, gps: 835, driver: 'Gbera P.', vehicle: '2188', status: 'Alerte' },
  { date: '03 Fév', litres: 92, distance: 886, conso: 31.8, theo: 30.0, gps: 880, driver: 'Amichia', vehicle: '2611LU01', status: 'Normal' },
  { date: '04 Fév', litres: 120, distance: 1306, conso: 38.2, theo: 29.0, gps: 1250, driver: 'Cyrille', vehicle: '970FF', status: 'Alerte' },
  { date: '05 Fév', litres: 100, distance: 1045, conso: 33.0, theo: 28.5, gps: 1040, driver: 'Berthe', vehicle: '935FF', status: 'Normal' },
  { date: '06 Fév', litres: 110, distance: 1150, conso: 32.5, theo: 30.0, gps: 1145, driver: 'Traore', vehicle: '2614LU01', status: 'Normal' },
  { date: '07 Fév', litres: 98, distance: 920, conso: 35.1, theo: 28.5, gps: 890, driver: 'Ouattara B.', vehicle: '3609LE01', status: 'Alerte' },
];

const App = () => {
  const [activeTab, setActiveTab] = useState('Consommation');

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Consommation', icon: Fuel },
    { name: 'Flotte', icon: Bus },
    { name: 'Chauffeurs', icon: Users },
    { name: 'Alertes', icon: AlertTriangle },
    { name: 'Paramètres', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-6 flex items-center space-x-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
            <Fuel className="text-white" size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight">OCEAN <span className="text-emerald-400">CORE</span></span>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.name 
                ? 'bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-500' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-slate-800">
          <div className="bg-slate-800 rounded-2xl p-4">
            <p className="text-xs text-slate-400 mb-1">Utilisateur</p>
            <p className="text-sm font-semibold">Kimana Misago</p>
            <p className="text-[10px] text-emerald-400 uppercase tracking-widest mt-1">Lead Innovation</p>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        
        {/* HEADER */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Consommation & Performance</h1>
            <p className="text-sm text-slate-500">Analyse croisée Excel + Télématique GPS</p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Rechercher un car ou chauffeur..." 
                className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none w-64 transition-all"
              />
            </div>
            <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>
            <button className="flex items-center space-x-2 bg-emerald-500 text-white px-4 py-2 rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20">
              <Download size={18} />
              <span className="text-sm font-medium">Export Rapport</span>
            </button>
          </div>
        </header>

        {/* DASHBOARD CONTENT */}
        <div className="p-8 space-y-8">
          
          {/* FILTERS BAR */}
          <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
              <Calendar size={16} className="text-slate-400" />
              <span className="text-sm font-medium">01 Jan - 15 Fév 2026</span>
            </div>
            <div className="flex items-center space-x-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
              <Bus size={16} className="text-slate-400" />
              <span className="text-sm font-medium">Tous les véhicules</span>
            </div>
            <div className="flex items-center space-x-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
              <MapPin size={16} className="text-slate-400" />
              <span className="text-sm font-medium">Abidjan - Bondoukou</span>
            </div>
            <button className="ml-auto flex items-center space-x-2 text-emerald-600 font-semibold text-sm hover:underline">
              <Filter size={16} />
              <span>Filtres avancés</span>
            </button>
          </div>

          {/* KPI CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KpiCard 
              title="L/100km Moyen" 
              value="32.5" 
              unit="L" 
              trend="+2.4%" 
              isUp={true} 
              color="emerald" 
              desc="Vs Moyenne Flotte"
            />
            <KpiCard 
              title="Volume Total" 
              value="15 480" 
              unit="Litres" 
              trend="-5.1%" 
              isUp={false} 
              color="blue" 
              desc="Consommation période"
            />
            <KpiCard 
              title="Coût Opérationnel" 
              value="12.4M" 
              unit="FCFA" 
              trend="+12%" 
              isUp={true} 
              color="slate" 
              desc="Carburant uniquement"
            />
            <KpiCard 
              title="Alertes Anomalies" 
              value="14" 
              unit="Cas" 
              trend="+3" 
              isUp={true} 
              color="red" 
              desc="Vols & Écarts KM suspectés"
            />
          </div>

          {/* CHARTS SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* MAIN CHART - CORRELATION */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-bold">Évolution de la Consommation</h3>
                  <p className="text-xs text-slate-400">Corrélation Litrage vs Kilométrage GPS</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-[10px] text-slate-500">Réel (Excel)</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-[10px] text-slate-500">GPS Track</span>
                  </div>
                </div>
              </div>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={rawData}>
                    <defs>
                      <linearGradient id="colorConso" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 12, fill: '#94a3b8'}} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 12, fill: '#94a3b8'}} 
                    />
                    <Tooltip 
                      contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                    />
                    <Legend verticalAlign="top" height={36} iconType="circle"/>
                    <Bar dataKey="litres" name="Litres versés" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
                    <Line type="monotone" dataKey="distance" name="KM Parcourus" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff'}} />
                    <Area type="monotone" dataKey="conso" name="Conso L/100" fill="url(#colorConso)" stroke="none" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* PERFORMANCE BY ROUTE */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold mb-6">Performance par Ligne</h3>
              <div className="space-y-6">
                <RouteProgress name="Abidjan - Bondoukou" value={38.2} target={30} load="Lourd" />
                <RouteProgress name="Abidjan - Yamoussoukro" value={28.5} target={30} load="Moyen" />
                <RouteProgress name="Abidjan - Adzopé" value={27.1} target={28} load="Léger" />
                <RouteProgress name="Abidjan - Bouaké" value={34.5} target={31} load="Lourd" />
                <RouteProgress name="Abidjan - San Pedro" value={31.2} target={30} load="Moyen" />
              </div>
              <div className="mt-8 pt-6 border-t border-slate-100">
                <p className="text-xs text-slate-400 italic">
                  * Les seuils sont ajustés automatiquement selon le coefficient de charge bagagerie.
                </p>
              </div>
            </div>

          </div>

          {/* TABLE SECTION */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold">Logs de Consommation Récents</h3>
              <div className="flex space-x-2">
                <button className="text-xs font-semibold px-3 py-1 bg-slate-100 rounded-lg">Tous</button>
                <button className="text-xs font-semibold px-3 py-1 text-red-600 bg-red-50 rounded-lg">Alertes uniquement</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-wider font-bold">
                  <tr>
                    <th className="px-6 py-4">Date / Heure</th>
                    <th className="px-6 py-4">Véhicule</th>
                    <th className="px-6 py-4">Chauffeur</th>
                    <th className="px-6 py-4">Lieu</th>
                    <th className="px-6 py-4 text-center">L/100km</th>
                    <th className="px-6 py-4 text-center">Statut</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rawData.map((log, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold">{log.date}</div>
                        <div className="text-[10px] text-slate-400">07:30 AM</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-blue-600">{log.vehicle}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">{log.driver}</div>
                        <div className="text-[10px] text-slate-400">Card: C102{idx}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">Station Adjamé</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-sm font-bold ${log.conso > log.theo + 5 ? 'text-red-500' : 'text-emerald-600'}`}>
                          {log.conso}L
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                          log.status === 'Normal' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-red-100 text-red-700'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all">
                          <ChevronRight size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

// COMPOSANTS INTERNES
const KpiCard = ({ title, value, unit, trend, isUp, color, desc }) => {
  const colors = {
    emerald: 'bg-emerald-500 shadow-emerald-500/20 text-emerald-500',
    blue: 'bg-blue-500 shadow-blue-500/20 text-blue-500',
    slate: 'bg-slate-800 shadow-slate-800/20 text-slate-800',
    red: 'bg-red-500 shadow-red-500/20 text-red-500',
  };

  return (
    <div className="card p-6 border border-slate-200 shadow-sm relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-16 h-16 opacity-5 -mr-4 -mt-4 rounded-full ${colors[color].split(' ')[0]}`}></div>
      <div className="flex justify-between items-start mb-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
        <div className={`flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-md ${isUp ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
          {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          <span>{trend}</span>
        </div>
      </div>
      <div className="flex items-baseline space-x-1">
        <h3 className="text-3xl font-black">{value}</h3>
        <span className="text-sm font-bold text-slate-400">{unit}</span>
      </div>
      <p className="text-[10px] text-slate-400 mt-2">{desc}</p>
    </div>
  );
};

const RouteProgress = ({ name, value, target, load }) => {
  const diff = value - target;
  const isOver = diff > 0;
  const percentage = Math.min((value / 45) * 100, 100);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-xs font-bold text-slate-800">{name}</p>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
            load === 'Lourd' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
          }`}>Charge {load}</span>
        </div>
        <div className="text-right">
          <p className="text-xs font-black">{value} L/100</p>
          <p className={`text-[10px] font-bold ${isOver ? 'text-red-500' : 'text-emerald-500'}`}>
            {isOver ? `+${diff.toFixed(1)}` : diff.toFixed(1)} vs Cible
          </p>
        </div>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ${isOver ? 'bg-red-500' : 'bg-emerald-500'}`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default App;