import * as React from "react";
import { useParams } from "wouter";
import { useGetQueue, useGetServiceById } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";

export function CallScreen() {
  const { serviceId } = useParams();
  const sId = parseInt(serviceId || "0", 10);

  // Fast polling for call screen
  const { data: queue } = useGetQueue(sId, { 
    query: { refetchInterval: 3000, enabled: !!sId } 
  });
  const { data: service } = useGetServiceById(sId, { query: { enabled: !!sId } });

  const currentlyCalled = queue?.find(t => t.status === 'CALLED' || t.status === 'IN_SERVICE');
  
  // Audio chime effect on new call
  const [lastCalledId, setLastCalledId] = React.useState<number | null>(null);
  
  React.useEffect(() => {
    if (currentlyCalled && currentlyCalled.status === 'CALLED' && currentlyCalled.id !== lastCalledId) {
      setLastCalledId(currentlyCalled.id);
      try {
        // Fallback simple chime since we don't have assets - using browser speech synth
        const utterance = new SpeechSynthesisUtterance(`Ticket numéro ${currentlyCalled.ticketNumber}, ${currentlyCalled.patientName}`);
        utterance.lang = 'fr-FR';
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.error("Speech synthesis failed", e);
      }
    }
  }, [currentlyCalled, lastCalledId]);

  if (!sId) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-2xl">Service non spécifié</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col overflow-hidden relative selection:bg-transparent">
      {/* Decorative background gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px]"></div>
      </div>

      <header className="p-8 border-b border-white/10 flex justify-between items-center relative z-10 bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Logo" className="w-16 h-16 filter brightness-0 invert" />
          <div>
            <h1 className="text-4xl font-display font-bold">WaitLess</h1>
            <p className="text-blue-300 text-xl">{service?.name}</p>
          </div>
        </div>
        <div className="text-3xl font-display font-light text-slate-300">
          {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-12 relative z-10">
        <AnimatePresence mode="wait">
          {currentlyCalled ? (
            <motion.div 
              key={currentlyCalled.id}
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 1.1, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
              className="text-center w-full max-w-5xl"
            >
              <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[3rem] p-16 shadow-2xl shadow-primary/20">
                <p className="text-4xl text-blue-300 mb-8 uppercase tracking-widest font-bold">Ticket Suivant</p>
                <div className="text-[15rem] md:text-[20rem] font-display font-bold leading-none mb-8 text-transparent bg-clip-text bg-gradient-to-br from-white to-blue-200 drop-shadow-[0_0_25px_rgba(255,255,255,0.3)]">
                  {currentlyCalled.ticketNumber}
                </div>
                <p className="text-5xl md:text-6xl text-white font-medium">{currentlyCalled.patientName}</p>
                
                {currentlyCalled.status === 'CALLED' && (
                  <motion.div 
                    animate={{ opacity: [0.5, 1, 0.5] }} 
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="mt-12 text-3xl text-green-400 font-bold"
                  >
                    Veuillez vous présenter au service
                  </motion.div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <div className="w-32 h-32 border-8 border-white/10 border-t-primary rounded-full animate-spin mx-auto mb-8"></div>
              <h2 className="text-5xl font-display text-slate-400">En attente du prochain appel...</h2>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
