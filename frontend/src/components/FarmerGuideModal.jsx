import React, { useState } from 'react';
import { X, Volume2, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const FarmerGuideModal = ({ isOpen, onClose }) => {
  const { lang } = useAuth();
  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  const steps = {
    en: [
      {
        title: "🌾 Step 1: Add Your Crops",
        text: "Tell customers what crops you are selling. Click the green 'Add Crop' button, choose your crop, set the price per Kilogram, and select how much stock you have.",
        voice: "Step one: Add your crops. Tell customers what crops you are selling. Click the green Add Crop button, choose your crop, set the price per Kilogram, and select how much stock you have.",
        icon: "🌾"
      },
      {
        title: "📦 Step 2: Watch For Customer Orders",
        text: "When a customer wants to buy your crops, a notification card will appear on your screen under 'New Orders'. You will see what they want to buy and how much money you will earn.",
        voice: "Step two: Watch for customer orders. When a customer wants to buy your crops, a notification card will appear on your screen under New Orders. You will see what they want to buy and how much money you will earn.",
        icon: "📦"
      },
      {
        title: "📞 Step 3: Contact the Customer & Deliver",
        text: "Click the Call button or WhatsApp button to speak to the customer directly. Pack the crop neatly, send it to the customer's address, and update the order status step-by-step on the screen.",
        voice: "Step three: Contact the customer and deliver. Click the Call button or WhatsApp button to speak to the customer directly. Pack the crop neatly, send it to the customer's address, and update the order status step-by-step on the screen.",
        icon: "🚚"
      },
      {
        title: "💰 Step 4: Earn Money & Build Trust",
        text: "Collect your payment upon delivery. Providing fresh crops on time helps you get a 5-star rating, making you a 'Verified Farmer' and bringing more customer orders!",
        voice: "Step four: Earn money and build trust. Collect your payment upon delivery. Providing fresh crops on time helps you get a 5-star rating, making you a Verified Farmer and bringing more customer orders!",
        icon: "💰"
      }
    ],
    te: [
      {
        title: "🌾 మొదటి దశ: మీ పంటను జోడించండి",
        text: "మీరు ఏ పంటలు అమ్ముతున్నారో కస్టమర్లకు తెలియజేయండి. ఆకుపచ్చరంగు 'పంటను జోడించు' బటన్ నొక్కి, మీ పంటను ఎంచుకుని, కేజీ ధరను మరియు మీ వద్ద ఎంత బరువు ఉందో నమోదు చేయండి.",
        voice: "మొదటి దశ: మీ పంటను జోడించండి. మీరు ఏ పంటలు అమ్ముతున్నారో కస్టమర్లకు తెలియజేయండి. ఆకుపచ్చరంగు పంటను జోడించు బటన్ నొక్కి, మీ పంటను ఎంచుకుని, కేజీ ధరను మరియు మీ వద్ద ఎంత బరువు ఉందో నమోదు చేయండి.",
        icon: "🌾"
      },
      {
        title: "📦 రెండవ దశ: కస్టమర్ ఆర్డర్లను గమనించండి",
        text: "కస్టమర్ మీ పంటను కొనాలనుకున్నప్పుడు, మీ స్క్రీన్‌పై 'కొత్త ఆర్డర్లు' కింద ఒక కార్డ్ కనిపిస్తుంది. వారు ఏమి కొనాలనుకుంటున్నారు మరియు మీరు ఎంత డబ్బు సంపాదిస్తారో అక్కడ చూడవచ్చు.",
        voice: "రెండవ దశ: కస్టమర్ ఆర్డర్లను గమనించండి. కస్టమర్ మీ పంటను కొనాలనుకున్నప్పుడు, మీ స్క్రీన్‌పై కొత్త ఆర్డర్లు కింద ఒక కార్డ్ కనిపిస్తుంది. వారు ఏమి కొనాలనుకుంటున్నారు మరియు మీరు ఎంత డబ్బు సంపాదిస్తారో అక్కడ చూడవచ్చు.",
        icon: "📦"
      },
      {
        title: "📞 మూడవ దశ: కస్టమర్‌ను సంప్రదించి డెలివరీ చేయండి",
        text: "కస్టమర్‌తో నేరుగా మాట్లాడటానికి ఫోన్ కాల్ లేదా వాట్సాప్ బటన్‌ను నొక్కండి. పంటను చక్కగా ప్యాక్ చేసి, కస్టమర్ చిరునామాకు పంపించి, స్క్రీన్‌పై డెలివరీ స్థితిని అప్‌డేట్ చేయండి.",
        voice: "మూడవ దశ: కస్టమర్‌ను సంప్రదించి డెలివరీ చేయండి. కస్టమర్‌తో నేరుగా మాట్లాడటానికి ఫోన్ కాల్ లేదా వాట్సాప్ బటన్‌ను నొక్కండి. పంటను చక్కగా ప్యాక్ చేసి, కస్టమర్ చిరునామాకు పంపించి, స్క్రీన్‌పై డెలివరీ స్థితిని అప్‌డేట్ చేయండి.",
        icon: "🚚"
      },
      {
        title: "💰 నాల్గవ దశ: డబ్బు సంపాదించండి & నమ్మకాన్ని పెంచండి",
        text: "డెలివరీ చేసిన తర్వాత మీ డబ్బును తీసుకోండి. తాజా పంటను సకాలంలో అందించడం ద్వారా మీకు మంచి రేటింగ్ లభిస్తుంది, ఇది మిమ్మల్ని 'వెరిఫైడ్ రైతు'గా మార్చి మరిన్ని ఆర్డర్లను తెస్తుంది!",
        voice: "నాల్గవ దశ: డబ్బు సంపాదించండి మరియు నమ్మకాన్ని పెంచండి. డెలివరీ చేసిన తర్వాత మీ డబ్బును తీసుకోండి. తాజా పంటను సకాలంలో అందించడం ద్వారా మీకు మంచి రేటింగ్ లభిస్తుంది, ఇది మిమ్మల్ని వెరిఫైడ్ రైతుగా మార్చి మరిన్ని ఆర్డర్లను తెస్తుంది!",
        icon: "💰"
      }
    ]
  };

  const currentSteps = steps[lang] || steps['en'];
  const currentStepData = currentSteps[step - 1];

  const handleListen = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentStepData.voice);
      utterance.lang = lang === 'te' ? 'te-IN' : 'en-IN';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleNext = () => {
    if (step < 4) {
      window.speechSynthesis.cancel();
      setStep(step + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      window.speechSynthesis.cancel();
      setStep(step - 1);
    }
  };

  const handleClose = () => {
    window.speechSynthesis.cancel();
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div className="glass" style={{ padding: '2.5rem', maxWidth: '520px', width: '100%', position: 'relative', border: '2px solid var(--primary)', borderRadius: '1.5rem', boxShadow: '0 0 40px rgba(0,255,157,0.25)', background: 'var(--bg-dark)' }}>
        
        {/* Close Button */}
        <button onClick={handleClose} aria-label="Close guide modal" style={{ position: 'absolute', right: '1.25rem', top: '1.25rem', background: 'rgba(128, 128, 128, 0.1)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(128, 128, 128, 0.2)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(128, 128, 128, 0.1)'}>
          <X size={20} />
        </button>

        {/* Listen Voice Help */}
        <button 
          onClick={handleListen} 
          style={{ position: 'absolute', left: '1.25rem', top: '1.25rem', background: 'rgba(0, 255, 157, 0.1)', border: '1px solid var(--primary)', borderRadius: '2rem', padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary)', cursor: 'pointer' }}
        >
          <Volume2 size={16} /> {lang === 'te' ? '🔊 వినండి' : '🔊 Listen'}
        </button>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          {/* Big Icon */}
          <div style={{ fontSize: '4.5rem', margin: '1rem 0' }}>{currentStepData.icon}</div>
          
          {/* Step Progress indicators */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i} 
                style={{ 
                  width: '12px', 
                  height: '12px', 
                  borderRadius: '50%', 
                  background: i === step ? 'var(--primary)' : 'var(--text-secondary)',
                  boxShadow: i === step ? '0 0 8px var(--primary)' : 'none',
                  transition: 'background 0.3s' 
                }} 
              />
            ))}
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '1rem' }}>{currentStepData.title}</h2>
          <p style={{ color: 'var(--text-light)', fontSize: '1.05rem', lineHeight: '1.7', marginBottom: '2.5rem', textAlign: 'left', background: 'var(--bg-darker)', padding: '1rem 1.25rem', borderRadius: '0.75rem', border: '1px solid var(--border)' }}>
            {currentStepData.text}
          </p>
        </div>

        {/* Actions Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
          <button 
            onClick={handlePrev} 
            disabled={step === 1}
            className="btn btn-ghost" 
            style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '1.5rem', visibility: step === 1 ? 'hidden' : 'visible' }}
          >
            <ArrowLeft size={18} /> {lang === 'te' ? 'వెనుకకు' : 'Back'}
          </button>

          <button 
            onClick={handleNext} 
            className="btn btn-primary" 
            style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '1.5rem' }}
          >
            {step === 4 ? (
              <>
                <CheckCircle size={18} /> {lang === 'te' ? 'పూర్తయింది' : 'Got it!'}
              </>
            ) : (
              <>
                {lang === 'te' ? 'తరువాత' : 'Next'} <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FarmerGuideModal;
