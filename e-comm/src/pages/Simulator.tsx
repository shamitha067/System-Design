import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/StoreContext';
import { Activity, Play, RefreshCw, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';

export default function Simulator() {
  const { state, dispatch, reset } = useStore();
  const [isRunning, setIsRunning] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const chartInterval = useRef<any>(null);
  
  // Last Unit Race Demo state
  const [raceResult, setRaceResult] = useState<{a: string, b: string} | null>(null);

  const startSimulation = () => {
    reset();
    setIsRunning(true);
    setChartData([]);
    
    const TOTAL_REQUESTS = 10000;
    const BATCH_SIZE = 500;
    const INTERVAL_MS = 50;
    
    let processed = 0;
    let localInventory = 100;
    
    let currentMetrics = {
      incomingRequests: 0,
      successfulReservations: 0,
      rejectedRequests: 0,
      oversoldUnits: 0,
    };
    
    const interval = setInterval(() => {
      if (processed >= TOTAL_REQUESTS) {
        clearInterval(interval);
        clearInterval(chartInterval.current);
        setIsRunning(false);
        return;
      }
      
      const batch = Math.min(BATCH_SIZE, TOTAL_REQUESTS - processed);
      processed += batch;
      
      let successfulInBatch = 0;
      let rejectedInBatch = 0;
      
      for(let i=0; i<batch; i++) {
        if (localInventory > 0) {
          localInventory--;
          successfulInBatch++;
        } else {
          rejectedInBatch++;
        }
      }
      
      currentMetrics.incomingRequests += batch;
      currentMetrics.successfulReservations += successfulInBatch;
      currentMetrics.rejectedRequests += rejectedInBatch;
      
      dispatch({
        type: 'UPDATE_METRICS_BATCH',
        payload: {
          inventory: {
            available: localInventory,
            reserved: currentMetrics.successfulReservations,
            total: 100,
            sold: 0
          },
          metrics: {
            ...currentMetrics
          }
        }
      });
      
    }, INTERVAL_MS);

    // Chart updates
    chartInterval.current = setInterval(() => {
      setChartData(prev => [...prev.slice(-20), {
        time: prev.length,
        requests: currentMetrics.incomingRequests,
        success: currentMetrics.successfulReservations,
        rejected: currentMetrics.rejectedRequests
      }]);
    }, 100);
  };
  
  useEffect(() => {
    return () => {
      clearInterval(chartInterval.current);
    }
  }, []);

  const runLastUnitTest = () => {
    // Reset to exactly 1 inventory for demo
    dispatch({
      type: 'SET_STATE',
      payload: {
        ...state,
        inventory: { total: 100, available: 1, reserved: 99, sold: 0 },
      }
    });
    setRaceResult(null);
    
    setTimeout(() => {
      // Simulate concurrent requests
      const reqA = Math.random();
      const reqB = Math.random();
      
      let aWins = reqA > reqB;
      
      setRaceResult({
        a: aWins ? 'Reservation Successful' : 'Reservation Failed (OUT OF STOCK)',
        b: !aWins ? 'Reservation Successful' : 'Reservation Failed (OUT OF STOCK)'
      });
      
      dispatch({
        type: 'UPDATE_METRICS_BATCH',
        payload: {
          inventory: { available: 0, reserved: 100, sold: 0, total: 100 },
          metrics: {
             ...state.metrics,
             successfulReservations: state.metrics.successfulReservations + 1,
             rejectedRequests: state.metrics.rejectedRequests + 1,
             incomingRequests: state.metrics.incomingRequests + 2,
             oversoldUnits: 0
          }
        }
      });
    }, 800);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-100 flex items-center gap-3">
            <Activity className="text-primary-500" /> High-Concurrency Simulator
          </h1>
          <p className="text-gray-400 mt-2">10,000 Customers competing for 100 Units.</p>
        </div>
        <button 
          onClick={startSimulation}
          disabled={isRunning}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold shadow-lg transition-all ${
            isRunning 
              ? 'bg-dark-700 text-gray-500 cursor-not-allowed' 
              : 'bg-primary-600 hover:bg-primary-500 text-white shadow-primary-600/25 active:scale-95'
          }`}
        >
          {isRunning ? <RefreshCw className="animate-spin" size={20} /> : <Play size={20} />}
          {isRunning ? 'SIMULATING...' : 'RUN FLASH SALE SIMULATION'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Flow Visualization */}
        <div className="lg:col-span-2 glass-card p-6 flex flex-col justify-between min-h-[300px] relative overflow-hidden">
          {isRunning && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent animate-[shimmer_2s_infinite]"></div>}
          
          <h2 className="text-xl font-bold mb-6 text-gray-200">Request Flow</h2>
          
          <div className="flex-1 flex items-center justify-between px-8 text-center relative">
            <div className="z-10 bg-dark-800 p-4 rounded-xl border border-dark-600 shadow-xl">
              <div className="text-sm text-gray-400 mb-1">Incoming Requests</div>
              <div className="text-3xl font-mono font-bold text-primary-400">{state.metrics.incomingRequests.toLocaleString()}</div>
            </div>
            
            <div className="flex-1 h-px bg-dark-600 relative overflow-visible">
               {isRunning && <div className="absolute top-1/2 left-0 w-full h-0.5 bg-primary-500/50 shadow-[0_0_10px_rgba(59,130,246,0.8)] animate-pulse -translate-y-1/2"></div>}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-dark-800 px-3 py-1 rounded-md text-xs border border-dark-600 whitespace-nowrap text-gray-400">API Gateway & Inventory Service</div>
            </div>
            
            <div className="z-10 flex flex-col gap-4">
              <div className="bg-dark-800 p-4 rounded-xl border border-accent-900/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <div className="text-sm text-gray-400 mb-1 flex items-center justify-center gap-1"><ShieldCheck size={14} className="text-accent-500"/> Successful</div>
                <div className="text-3xl font-mono font-bold text-accent-500">{state.metrics.successfulReservations}</div>
              </div>
              <div className="bg-dark-800 p-4 rounded-xl border border-alert-900/50">
                <div className="text-sm text-gray-400 mb-1 flex items-center justify-center gap-1"><AlertTriangle size={14} className="text-gray-500"/> Rejected</div>
                <div className="text-xl font-mono font-bold text-gray-500">{state.metrics.rejectedRequests.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Metrics Panel */}
        <div className="glass-card p-6">
           <h2 className="text-xl font-bold mb-6 text-gray-200">System State</h2>
           <div className="space-y-4">
             <MetricRow label="Inventory Remaining" value={state.inventory.available} valueColor={state.inventory.available === 0 ? 'text-alert-500' : 'text-primary-400'} />
             <MetricRow label="Oversold Units" value={state.metrics.oversoldUnits} valueColor={state.metrics.oversoldUnits > 0 ? 'text-alert-500' : 'text-accent-500'} />
             <div className="h-px bg-dark-700 my-4"></div>
             <MetricRow label="Successful Reservations" value={state.metrics.successfulReservations} valueColor="text-accent-500" />
             <MetricRow label="Rejected Requests" value={state.metrics.rejectedRequests} valueColor="text-gray-400" />
             <div className="h-px bg-dark-700 my-4"></div>
             <MetricRow label="Payment Success" value={state.metrics.paymentSuccess} />
             <MetricRow label="Orders Created" value={state.metrics.ordersCreated} />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="glass-card p-6 h-[300px]">
          <h2 className="text-lg font-bold mb-4 text-gray-200">Request Volume vs Success</h2>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorSucc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="requests" stroke="#3B82F6" fillOpacity={1} fill="url(#colorReq)" isAnimationActive={false} />
              <Area type="step" dataKey="success" stroke="#10B981" fillOpacity={1} fill="url(#colorSucc)" isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Last Unit Race Condition Demo */}
        <div className="glass-card p-6 border-alert-900/50">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-200 flex items-center gap-2"><Zap className="text-orange-500" size={20}/> Last Unit Test</h2>
              <p className="text-sm text-gray-400 mt-1">Simulate two concurrent requests for the final unit.</p>
            </div>
            <button onClick={runLastUnitTest} disabled={isRunning} className="px-4 py-2 bg-dark-700 hover:bg-dark-600 rounded text-sm font-medium transition-colors disabled:opacity-50">
              Run Test
            </button>
          </div>
          
          <div className="bg-dark-900 rounded-lg p-6 relative">
            <div className="text-center mb-6">
               <span className="text-xs text-gray-500 uppercase tracking-wider">Inventory</span>
               <div className="text-2xl font-mono font-bold text-primary-400">1</div>
            </div>
            
            <div className="flex justify-between relative">
              <div className="text-center w-1/2 pr-4 border-r border-dark-700">
                <div className="font-bold mb-2">Customer A</div>
                <div className="text-xs bg-primary-600/20 text-primary-400 py-1 px-2 rounded w-max mx-auto mb-4">BUY NOW</div>
                {raceResult && (
                  <div className={`text-sm font-mono p-2 rounded ${raceResult.a.includes('Success') ? 'bg-accent-500/10 text-accent-500 border border-accent-500/20' : 'bg-alert-500/10 text-alert-500 border border-alert-500/20'}`}>
                    {raceResult.a}
                  </div>
                )}
              </div>
              
              <div className="text-center w-1/2 pl-4">
                <div className="font-bold mb-2">Customer B</div>
                <div className="text-xs bg-primary-600/20 text-primary-400 py-1 px-2 rounded w-max mx-auto mb-4">BUY NOW</div>
                {raceResult && (
                  <div className={`text-sm font-mono p-2 rounded ${raceResult.b.includes('Success') ? 'bg-accent-500/10 text-accent-500 border border-accent-500/20' : 'bg-alert-500/10 text-alert-500 border border-alert-500/20'}`}>
                    {raceResult.b}
                  </div>
                )}
              </div>
              
              {raceResult && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-dark-800 p-2 rounded-full border border-dark-600 shadow-xl z-10">
                  <ShieldCheck className="text-accent-500" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricRow({ label, value, valueColor = 'text-gray-100' }: { label: string, value: number, valueColor?: string }) {
  return (
    <div className="flex justify-between items-center font-mono text-sm">
      <span className="text-gray-400">{label}</span>
      <span className={`font-bold text-lg ${valueColor}`}>{typeof value === 'number' ? value.toLocaleString() : value}</span>
    </div>
  );
}
