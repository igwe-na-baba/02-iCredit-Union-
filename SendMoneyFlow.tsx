import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Recipient, Transaction, Account, SecuritySettings, View, TransactionStatus } from './types';
import { STANDARD_FEE, EXPRESS_FEE, EXCHANGE_RATES, TRANSFER_PURPOSES, USER_PIN, NETWORK_AUTH_CODE } from './constants';
import { SpinnerIcon, CheckCircleIcon, ExclamationTriangleIcon, KeypadIcon, FaceIdIcon, ShieldCheckIcon, CameraIcon, ClipboardDocumentIcon, XIcon, XCircleIcon, NetworkIcon, GlobeAltIcon } from './components/Icons';
import { triggerHaptic } from './utils/haptics';
import { PaymentReceipt } from './components/PaymentReceipt'; // Import the new component

interface SendMoneyFlowProps {
  recipients: Recipient[];
  accounts: Account[];
  createTransaction: (transaction: Omit<Transaction, 'id' | 'status' | 'estimatedArrival' | 'statusTimestamps' | 'type'>) => Transaction | null;
  transactions: Transaction[];
  securitySettings: SecuritySettings;
  hapticsEnabled: boolean;
  onAuthorizeTransaction: (transactionId: string) => void;
  setActiveView: (view: View) => void;
  onClose: () => void;
  // FIX: Added missing onContactSupport prop
  onContactSupport: () => void;
}

const securityCheckMessages = [
    'Verifying transaction details...',
    'Running fraud analysis...',
    'Performing compliance screening...',
    'Finalizing secure transfer...'
];


// Main Component
export const SendMoneyFlow: React.FC<SendMoneyFlowProps> = ({ recipients, accounts, createTransaction, transactions, securitySettings, hapticsEnabled, onAuthorizeTransaction, setActiveView, onClose, onContactSupport }) => {
  const [step, setStep] = useState(0); // 0: Details, 1: Review, 2: Authorize, 3: SecurityCheck, 4: Complete
  
  const availableSourceAccounts = accounts.filter(acc => acc.balance > 0);
  // Form State
  const [sourceAccountId, setSourceAccountId] = useState<string>(availableSourceAccounts.length > 0 ? availableSourceAccounts[0].id : '');
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(recipients.length > 0 ? recipients[0] : null);
  const [sendAmount, setSendAmount] = useState('');
  const [purpose, setPurpose] = useState(TRANSFER_PURPOSES[0]);
  const [deliverySpeed, setDeliverySpeed] = useState<'Standard' | 'Express'>('Standard');
  const [rateLockCountdown, setRateLockCountdown] = useState(60);

  // Security State
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const authAttempted = useRef(false);

  // Transaction State
  const [createdTransaction, setCreatedTransaction] = useState<Transaction | null>(null);
  const [securityCheckMessageIndex, setSecurityCheckMessageIndex] = useState(0);
  
  const sourceAccount = accounts.find(acc => acc.id === sourceAccountId);

  const fee = deliverySpeed === 'Express' ? EXPRESS_FEE : STANDARD_FEE;
  const numericSendAmount = parseFloat(sendAmount) || 0;
  const exchangeRate = selectedRecipient ? EXCHANGE_RATES[selectedRecipient.country.currency] : 0;
  const receiveAmount = numericSendAmount * exchangeRate;
  const totalCost = numericSendAmount + fee;
  
  const amountError = useMemo(() => {
    if (numericSendAmount < 0) return "Amount cannot be negative.";
    if (numericSendAmount > 0 && !sourceAccount) return "Source account not found.";
    if (numericSendAmount > 0 && totalCost > sourceAccount!.balance) {
        return `Total cost of ${totalCost.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} exceeds your balance.`;
    }
    return null;
  }, [numericSendAmount, totalCost, sourceAccount]);
  
  const isAmountInvalid = amountError !== null || numericSendAmount <= 0;

  const liveTransaction = useMemo(() => {
    if (!createdTransaction) return null;
    return transactions.find(t => t.id === createdTransaction.id) || createdTransaction;
  }, [transactions, createdTransaction]);

  const hapticTrigger = useCallback(() => {
    if(hapticsEnabled) triggerHaptic();
  }, [hapticsEnabled]);

  const handleNextStep = useCallback(() => {
    hapticTrigger();
    setStep(prev => prev + 1);
  }, [hapticTrigger]);

  const handlePrevStep = useCallback(() => {
    hapticTrigger();
    setStep(prev => prev - 1);
  }, [hapticTrigger]);

  useEffect(() => {
    if (step === 1 && rateLockCountdown > 0) {
        const timer = setInterval(() => setRateLockCountdown(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    } else if (step !== 1) {
        setRateLockCountdown(60); // Reset timer when leaving review step
    }
  }, [step, rateLockCountdown]);

  useEffect(() => {
    if (step === 3) { // Security Check step
        const interval = setInterval(() => {
            setSecurityCheckMessageIndex(prev => {
                if (prev >= securityCheckMessages.length - 1) {
                    clearInterval(interval);
                    setTimeout(() => handleNextStep(), 500); // Move to success step
                    return prev;
                }
                return prev + 1;
            });
        }, 1200);
        return () => clearInterval(interval);
    }
  }, [step, handleNextStep]);
  
  const handleConfirmAndSend = useCallback(() => {
    if (!selectedRecipient || !sourceAccount) return;
    hapticTrigger();

    const newTransaction = createTransaction({
      accountId: sourceAccount.id,
      recipient: selectedRecipient,
      sendAmount: numericSendAmount,
      receiveAmount: receiveAmount,
      fee: fee,
      deliverySpeed: deliverySpeed,
      exchangeRate: exchangeRate,
      description: `Transfer to ${selectedRecipient.fullName}`,
      purpose
    });
    
    if(newTransaction) {
        setCreatedTransaction(newTransaction);
        handleNextStep(); // Move to Security Check
    }
  }, [createTransaction, exchangeRate, hapticTrigger, numericSendAmount, purpose, receiveAmount, selectedRecipient, sourceAccount, handleNextStep, fee, deliverySpeed]);

  const handlePinSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    hapticTrigger();
    setIsAuthenticating(true);
    setPinError('');
    setTimeout(() => { // Simulate API call
      if (pin === USER_PIN) {
        handleConfirmAndSend();
      } else {
        setPinError('Incorrect PIN. Please try again.');
        setIsAuthenticating(false);
      }
    }, 500);
  }, [hapticTrigger, pin, handleConfirmAndSend]);

  const handleBiometricAuth = useCallback(async () => {
    hapticTrigger();
    setIsAuthenticating(true);
    setPinError('');
    try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        handleConfirmAndSend();
    } catch (error) {
        console.error("Biometric auth failed", error);
        setPinError('Biometric authentication failed. Please use your PIN.');
        setIsAuthenticating(false);
    }
  }, [hapticTrigger, handleConfirmAndSend]);
  
  useEffect(() => {
    if (step === 2 && securitySettings.biometricsEnabled && !authAttempted.current) {
      authAttempted.current = true;
      handleBiometricAuth();
    }
    if (step !== 2) authAttempted.current = false;
  }, [step, securitySettings.biometricsEnabled, handleBiometricAuth]);

  const handleStartOver = () => {
    hapticTrigger();
    setStep(0);
    setSelectedRecipient(recipients.length > 0 ? recipients[0] : null);
    setSourceAccountId(availableSourceAccounts.length > 0 ? availableSourceAccounts[0].id : '');
    setSendAmount('');
    setPurpose(TRANSFER_PURPOSES[0]);
    setPin('');
    setPinError('');
    setCreatedTransaction(null);
  };

  const renderStepContent = () => {
    switch(step) {
      case 0:
        return (
          <>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Send Money</h2>
            <div className="space-y-4">
               <div>
                <label className="block text-sm font-medium text-slate-700">Send From</label>
                <select value={sourceAccountId} onChange={e => setSourceAccountId(e.target.value)} className="mt-1 w-full bg-slate-200 p-3 rounded-md shadow-digital-inset">
                  {availableSourceAccounts.map(acc => ( <option key={acc.id} value={acc.id}> {acc.nickname || acc.type} ({acc.balance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}) </option> ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Recipient</label>
                <select value={selectedRecipient?.id || ''} onChange={e => setSelectedRecipient(recipients.find(r => r.id === e.target.value) || null)} className="mt-1 w-full bg-slate-200 p-3 rounded-md shadow-digital-inset">
                  {recipients.map(r => <option key={r.id} value={r.id}> {r.nickname ? `${r.nickname} (${r.fullName})` : r.fullName} </option> )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">You Send</label>
                <div className="mt-1 relative rounded-md shadow-digital-inset bg-slate-200 flex items-center">
                  <input type="number" value={sendAmount} onChange={e => setSendAmount(e.target.value)} className="w-full bg-transparent border-0 p-3 pr-4 text-lg font-mono text-slate-800 flex-grow" placeholder="0.00"/>
                  <div className="p-3 flex items-center space-x-2 border-l border-slate-300 pointer-events-none">
                     <img src={`https://flagcdn.com/w40/us.png`} alt="USD flag" className="w-5 h-auto" />
                    <span className="text-slate-500 font-semibold">USD</span>
                  </div>
                </div>
                {amountError && <p className="text-red-500 text-xs mt-1">{amountError}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Delivery Speed</label>
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setDeliverySpeed('Standard')} className={`p-3 rounded-lg text-left transition-all ${deliverySpeed === 'Standard' ? 'shadow-digital-inset' : 'shadow-digital'}`}>
                        <p className="font-bold text-slate-800">Standard</p>
                        <p className="text-xs text-slate-500">~2-3 business days</p>
                        <p className="text-sm font-semibold text-primary mt-1">{STANDARD_FEE.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} Fee</p>
                    </button>
                     <button onClick={() => setDeliverySpeed('Express')} className={`p-3 rounded-lg text-left transition-all ${deliverySpeed === 'Express' ? 'shadow-digital-inset' : 'shadow-digital'}`}>
                        <p className="font-bold text-slate-800">Express</p>
                        <p className="text-xs text-slate-500">Within 24 hours</p>
                        <p className="text-sm font-semibold text-primary mt-1">{EXPRESS_FEE.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} Fee</p>
                    </button>
                </div>
              </div>
              <div className="p-4 bg-slate-200 rounded-lg shadow-digital-inset space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-slate-600">Total Debited:</span>
                    <span className="font-mono text-slate-800 font-semibold">{totalCost.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                </div>
                 <div className="flex justify-between font-bold text-base">
                    <span className="text-slate-600">Recipient Gets:</span>
                    <span className="text-primary">{receiveAmount.toLocaleString('en-US', { style: 'currency', currency: selectedRecipient?.country.currency })}</span>
                </div>
              </div>
              <button onClick={handleNextStep} disabled={isAmountInvalid || !selectedRecipient} className="w-full py-3 text-white bg-primary rounded-lg font-semibold shadow-md disabled:bg-primary/50">
                Review Transfer
              </button>
            </div>
          </>
        );
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-800 text-center">Review Your Transfer</h2>
            <div className="p-4 bg-slate-200 rounded-lg shadow-digital-inset space-y-3 divide-y divide-slate-300">
                <div className="pt-2"> <span className="text-sm text-slate-500">From</span> <p className="font-semibold text-slate-800">{sourceAccount?.nickname || sourceAccount?.type}</p> </div>
                <div className="pt-3"> <span className="text-sm text-slate-500">To</span> <p className="font-semibold text-slate-800">{selectedRecipient?.fullName}</p> </div>
                <div className="pt-3"> <span className="text-sm text-slate-500">You Send</span> <p className="font-semibold text-slate-800">{numericSendAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p> </div>
                <div className="pt-3"> <span className="text-sm text-slate-500">Recipient Gets</span> <p className="font-semibold text-primary">{receiveAmount.toLocaleString('en-US', { style: 'currency', currency: selectedRecipient?.country.currency })}</p> </div>
                 <div className="pt-3"> <span className="text-sm text-slate-500">Delivery</span> <p className="font-semibold text-slate-800">{deliverySpeed}</p> </div>
            </div>
             <div className="p-4 bg-slate-200 rounded-lg shadow-digital-inset text-center">
                 <p className="text-xs text-slate-500">Your exchange rate is locked for:</p>
                 <p className={`text-xl font-bold font-mono ${rateLockCountdown < 10 ? 'text-red-500' : 'text-slate-800'}`}>{Math.floor(rateLockCountdown / 60)}:{String(rateLockCountdown % 60).padStart(2, '0')}</p>
             </div>
             <div className="mt-6 flex space-x-3">
                <button onClick={handlePrevStep} className="w-full py-3 text-slate-700 bg-slate-200 rounded-lg font-semibold shadow-digital">Back</button>
                <button onClick={handleNextStep} disabled={rateLockCountdown <= 0} className="w-full py-3 text-white bg-green-500 rounded-lg font-semibold shadow-md disabled:bg-green-300"> Confirm & Authorize </button>
            </div>
          </div>
        );
      case 2:
          return (
              <div className="text-center p-4">
                  <h2 className="text-2xl font-bold text-slate-800">Authorize Payment</h2>
                  <form onSubmit={handlePinSubmit}>
                      <label className="text-slate-600 my-4 block">Please enter your 4-digit security PIN.</label>
                      <input type="password" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} className="w-48 mx-auto bg-slate-200 border-0 p-3 text-center text-3xl tracking-[.75em] rounded-md shadow-digital-inset" maxLength={4} placeholder="----" autoFocus />
                      {pinError && <p className="mt-2 text-sm text-red-500">{pinError}</p>}
                       <div className="mt-6 flex space-x-3">
                          <button type="button" onClick={handlePrevStep} className="w-full py-3 text-slate-700 bg-slate-200 rounded-lg font-semibold shadow-digital" disabled={isAuthenticating}>Back</button>
                          <button type="submit" disabled={pin.length !== 4 || isAuthenticating} className="w-full py-3 text-white bg-primary rounded-lg font-semibold shadow-md disabled:bg-primary/50"> Authorize & Send </button>
                      </div>
                  </form>
              </div>
          );
      case 3: // Security Check
        return (
            <div className="text-center p-8">
                <SpinnerIcon className="w-12 h-12 text-primary mx-auto" />
                <h3 className="mt-4 text-xl font-bold text-slate-800">{securityCheckMessages[securityCheckMessageIndex]}</h3>
                <p className="text-slate-600 mt-2">This is a standard security procedure to protect your account.</p>
            </div>
        );
      case 4:
        if (!liveTransaction || !sourceAccount) return <div className="text-center p-8"> <SpinnerIcon className="w-12 h-12 text-primary mx-auto"/> <p className="mt-4 text-slate-600">Finalizing transaction...</p> </div>;
        
        return (
            <PaymentReceipt 
                transaction={liveTransaction}
                sourceAccount={sourceAccount}
                onStartOver={handleStartOver}
                onViewActivity={() => { onClose(); setActiveView('history'); }}
                onAuthorizeTransaction={onAuthorizeTransaction}
                // FIX: Pass the onContactSupport prop
                onContactSupport={onContactSupport}
            />
        );
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-slate-100 rounded-2xl shadow-2xl p-6 w-full max-w-lg relative animate-fade-in-up">
            <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600"><XIcon className="w-6 h-6"/></button>
            <div className="mb-8 h-8 px-4">
                {/* Stepper component removed as the flow is now contained within PaymentReceipt */}
            </div>
            {renderStepContent()}
        </div>
        <style>{`
            @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
            .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
            @keyframes fade-in-up {
              0% { opacity: 0; transform: translateY(20px) scale(0.95); }
              100% { opacity: 1; transform: translateY(0) scale(1); }
            }
            .animate-fade-in-up { animation: fade-in-up 0.4s ease-out forwards; }
        `}</style>
    </div>
  );
};