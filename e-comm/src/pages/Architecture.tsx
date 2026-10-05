import React from 'react';
import { Server, Database, Activity, Globe, Shield, CreditCard, ShoppingBag, Box } from 'lucide-react';

export default function Architecture() {
  return (
    <div className="p-8 w-full max-w-none">
      <h1 className="text-4xl font-bold mb-12 text-gray-100 text-center">System Architecture</h1>
      
      <div className="glass-card p-12 max-w-5xl mx-auto w-full">
        <div className="flex flex-col items-center gap-6 text-sm font-medium">
          
          {/* External */}
          <ArchNode icon={<Globe />} label="CUSTOMERS (10,000+)" color="bg-blue-500/20 text-blue-400 border-blue-500/30" />
          <Arrow />
          
          {/* Edge */}
          <ArchNode icon={<Shield />} label="LOAD BALANCER & WAF" color="bg-dark-700 text-gray-300 border-dark-600" />
          <Arrow />
          
          <ArchNode icon={<Activity />} label="API GATEWAY (Rate Limiting)" color="bg-dark-700 text-gray-300 border-dark-600" />
          <Arrow />
          
          {/* Services */}
          <div className="grid grid-cols-3 gap-8 w-full max-w-3xl border border-dark-700 rounded-xl p-6 bg-dark-900/50 relative">
            <div className="absolute -top-3 left-6 bg-dark-900 px-2 text-xs text-gray-500 uppercase tracking-widest">Microservices Cluster</div>
            
            <div className="col-span-3 flex justify-center">
               <ArchNode icon={<ShoppingBag />} label="PRODUCT / SALE SERVICE" color="bg-primary-900/40 text-primary-400 border-primary-500/30" />
            </div>
            
            <div className="col-span-3 flex justify-center">
              <Arrow />
            </div>

            <div className="col-span-3 flex justify-center gap-12 relative">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-px bg-dark-600 -z-10"></div>
               <ArchNode icon={<Box />} label="INVENTORY & RESERVATION" color="bg-accent-900/40 text-accent-400 border-accent-500/30" />
               <ArchNode icon={<CreditCard />} label="CHECKOUT & PAYMENT" color="bg-purple-900/40 text-purple-400 border-purple-500/30" />
            </div>
            
            <div className="col-span-3 flex justify-center mt-6">
               <Arrow />
            </div>
            
            <div className="col-span-3 flex justify-center">
               <ArchNode icon={<Server />} label="ORDER SERVICE" color="bg-orange-900/40 text-orange-400 border-orange-500/30" />
            </div>
          </div>
          
          <Arrow />
          
          {/* Data Layer */}
          <div className="flex gap-8">
            <ArchNode icon={<Database />} label="REDIS (Inventory Cache/Locks)" color="bg-alert-900/30 text-alert-400 border-alert-500/30" />
            <ArchNode icon={<Activity />} label="KAFKA (Message Queue)" color="bg-dark-700 text-gray-300 border-dark-600" />
            <ArchNode icon={<Database />} label="POSTGRESQL (Orders DB)" color="bg-blue-900/30 text-blue-400 border-blue-500/30" />
          </div>

        </div>
      </div>
    </div>
  );
}

function ArchNode({ icon, label, color }: { icon: React.ReactNode, label: string, color: string }) {
  return (
    <div className={`flex items-center gap-3 px-6 py-4 rounded-xl border shadow-lg backdrop-blur-sm ${color}`}>
      {icon}
      <span className="tracking-wide">{label}</span>
    </div>
  );
}

function Arrow() {
  return <div className="h-8 w-px bg-gradient-to-b from-dark-500 to-dark-700 relative">
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rotate-45 border-r border-b border-dark-500"></div>
  </div>;
}
