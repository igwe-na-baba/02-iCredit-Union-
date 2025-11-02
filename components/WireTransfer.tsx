import React, { useState, useMemo, useEffect } from 'react';
import { Account, Recipient, Country, Transaction } from '../types';
import { BANK_ACCOUNT_CONFIG, TRANSFER_PURPOSES, USER_PIN, EXCHANGE_RATES } from '../constants';
import * as Icons from './Icons';
import { CountrySelector } from './CountrySelector';
import { BankSelector } from './BankSelector';

interface WireTransferProps {
    accounts: Account[];
    recipients: Recipient[];
    onSendWire: (data: any) => Transaction | null;
    onClose: () => void;
}

const StepIndicator: React.FC<{ icon: React.ReactNode; label: string; isActive: boolean; isCompleted: boolean }> = ({ icon, label, isActive, isCompleted }) => (
    <div className="flex flex-col items-center">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted ? 'bg-green-500 text-white' : isActive ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500 shadow-digital-inset'}`}>
            {isCompleted ? <Icons.CheckCircleIcon className="w-7 h-7" /> : icon}
        </div>
        <p className={`mt-2 text-xs text-center font-medium ${isActive || isCompleted ? 'text-slate-700' : 'text-slate-400'}`}>{label}</p>
    </div>
);

export const WireTransfer: React.FC<WireTransferProps> = ({ accounts, recipients, onSendWire, onClose }) => {
    const [step, setStep] = useState(0); // 0: Details, 1: Review, 2: Authorize, 3: Success
    const [isProcessing, setIsProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string | null>>({});
    const [isBankSelectorOpen, setIsBankSelectorOpen] = useState(false);
    const [sentTransaction, setSentTransaction] = useState<Transaction | null>(null);

    const [formData, setFormData] = useState({
        sourceAccountId: accounts.find(a => a.balance > 0)?.id || '',
        transferType: 'domestic',
        recipientCountry: { code: 'US', name: 'United States', currency: 'USD', symbol: '$' } as Country,
        recipientName: '',
        recipientAddress: '',
        recipientCity: '',
        recipientState: '',
        recipientPostalCode: '',
        bankName: '',
        bankAddress: '',
        accountNumber: '',
        swiftBic: '',
        routingNumber: '',
        intermediaryBank: '',
        amount: '',
        purpose: TRANSFER_PURPOSES[0],
    });

    const countryConfig = useMemo(() => BANK_ACCOUNT_CONFIG[formData.recipientCountry.code] || BANK_ACCOUNT_CONFIG.default, [formData.recipientCountry.code]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({...prev, [name]: null}));
    };
    
    const handleCountryChange = (country: Country) => {
        setFormData(prev => ({...prev, recipientCountry: country, bankName: ''}));
        setErrors({});
    };

    const handleBankSelect = (bankName: string) => {
        setFormData(prev => ({ ...prev, bankName }));
        if (errors.bankName) setErrors(prev => ({...prev, bankName: null}));
    };

    const validateStep = () => {
        const newErrors: Record<string, string | null> = {};
        if (!formData.sourceAccountId) newErrors.sourceAccountId = "Source account is required.";
        if (!formData.recipientName) newErrors.recipientName = "Recipient name is required.";
        if (!formData.bankName) newErrors.bankName = "Bank name is required.";
        if (!formData.accountNumber) newErrors.accountNumber = "Account number is required.";
        if (formData.transferType === 'international' && !formData.swiftBic) newErrors.swiftBic = "SWIFT/BIC is required.";
        if (formData.transferType === 'domestic' && !formData.routingNumber) newErrors.routingNumber = "Routing number is required.";
        if (Number(formData.amount) <= 0) newErrors.amount = "Please enter a valid amount.";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep()) {
            setStep(1);
        }
    };
    
    const handleConfirm = () => {
        if (validateStep()) {
            setIsProcessing(true);
            const tx = onSendWire(formData);
            setTimeout(() => {
                setIsProcessing(false);
                if (tx) {
                    setSentTransaction(tx);
                    setStep(2);
                } else {
                    setErrors({ form: "Transaction failed. Please check your balance and try again." });
                }
            }, 1500);
        }
    };
    
    const inputClasses = (name: string) => `mt-1 w-full bg-slate-200 border-0 p-3 rounded-md shadow-digital-inset focus:ring-2 ${errors[name] ? 'ring-red-500' : 'focus:ring-primary'}`;

    return (
        <>
        {isBankSelectorOpen && (
            <BankSelector 
                countryCode={formData.recipientCountry.code}
                onSelect={handleBankSelect}
                onClose={() => setIsBankSelectorOpen(false)}
            />
        )}
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-slate-100 rounded-2xl shadow-2xl p-6 w-full max-w-2xl relative animate-fade-in-up">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600"><Icons.XIcon className="w-6 h-6"/></button>

                {step === 0 && (
                <>
                    <h2 className="text-2xl font-bold text-slate-800 mb-6">Send a Wire Transfer</h2>
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                        {/* Transfer Type */}
                        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-200 rounded-lg shadow-digital-inset">
                           <button onClick={() => setFormData(p => ({...p, transferType: 'domestic', recipientCountry: { code: 'US', name: 'United States', currency: 'USD', symbol: '$' }}))} className={`py-2 rounded-md font-semibold ${formData.transferType === 'domestic' ? 'bg-white shadow' : ''}`}>Domestic</button>
                           <button onClick={() => setFormData(p => ({...p, transferType: 'international'}))} className={`py-2 rounded-md font-semibold ${formData.transferType === 'international' ? 'bg-white shadow' : ''}`}>International</button>
                        </div>
                        
                        {/* Recipient Details */}
                        <fieldset className="p-4 border border-slate-300 rounded-lg">
                            <legend className="font-bold px-2">Recipient Details</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Full Name</label>
                                    <input type="text" name="recipientName" value={formData.recipientName} onChange={handleChange} className={inputClasses('recipientName')} />
                                    {errors.recipientName && <p className="text-red-500 text-xs mt-1">{errors.recipientName}</p>}
                                </div>
                                {formData.transferType === 'international' && (
                                    <div>
                                        <label className="text-sm font-medium">Country</label>
                                        <CountrySelector selectedCountry={formData.recipientCountry} onSelect={handleCountryChange} className={`w-full flex items-center justify-between text-left ${inputClasses('recipientCountry')}`} />
                                    </div>
                                )}
                            </div>
                        </fieldset>

                        {/* Bank Details */}
                        <fieldset className="p-4 border border-slate-300 rounded-lg">
                            <legend className="font-bold px-2">Recipient's Bank</legend>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Bank Name</label>
                                    <button type="button" onClick={() => setIsBankSelectorOpen(true)} className={`w-full flex items-center justify-between text-left ${inputClasses('bankName')}`}>
                                        <span className={formData.bankName ? '' : 'text-slate-500'}>{formData.bankName || 'Select a bank...'}</span><span>▼</span>
                                    </button>
                                    {errors.bankName && <p className="text-red-500 text-xs mt-1">{errors.bankName}</p>}
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Account Number</label>
                                    <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleChange} className={inputClasses('accountNumber')} />
                                    {errors.accountNumber && <p className="text-red-500 text-xs mt-1">{errors.accountNumber}</p>}
                                </div>
                                {formData.transferType === 'domestic' && (
                                     <div>
                                        <label className="text-sm font-medium">Routing Number</label>
                                        <input type="text" name="routingNumber" value={formData.routingNumber} onChange={handleChange} className={inputClasses('routingNumber')} />
                                        {errors.routingNumber && <p className="text-red-500 text-xs mt-1">{errors.routingNumber}</p>}
                                    </div>
                                )}
                                 {formData.transferType === 'international' && (
                                     <div>
                                        <label className="text-sm font-medium">SWIFT / BIC</label>
                                        <input type="text" name="swiftBic" value={formData.swiftBic} onChange={handleChange} className={inputClasses('swiftBic')} />
                                        {errors.swiftBic && <p className="text-red-500 text-xs mt-1">{errors.swiftBic}</p>}
                                    </div>
                                )}
                            </div>
                        </fieldset>

                         {/* Transfer Details */}
                        <fieldset className="p-4 border border-slate-300 rounded-lg">
                            <legend className="font-bold px-2">Transfer Details</legend>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div>
                                    <label className="text-sm font-medium">From Account</label>
                                    <select name="sourceAccountId" value={formData.sourceAccountId} onChange={handleChange} className={inputClasses('sourceAccountId')}>
                                        {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.nickname} ({acc.balance.toLocaleString('en-US', {style:'currency', currency:'USD'})})</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Amount (USD)</label>
                                    <input type="number" name="amount" value={formData.amount} onChange={handleChange} className={inputClasses('amount')} />
                                     {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
                                </div>
                            </div>
                        </fieldset>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button onClick={handleNext} className="px-6 py-3 text-white bg-primary rounded-lg font-semibold shadow-md">Review Transfer</button>
                    </div>
                </>
                )}

                {step === 1 && (
                    <>
                        <h2 className="text-2xl font-bold text-slate-800 mb-6">Review Wire Transfer</h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span>From:</span><span className="font-semibold">{accounts.find(a => a.id === formData.sourceAccountId)?.nickname}</span></div>
                            <div className="flex justify-between"><span>To:</span><span className="font-semibold">{formData.recipientName}</span></div>
                            <div className="flex justify-between"><span>Bank:</span><span className="font-semibold">{formData.bankName}</span></div>
                             <div className="flex justify-between font-bold text-base border-t pt-2 mt-2"><span>Amount:</span> <span>{Number(formData.amount).toLocaleString('en-US', {style:'currency', currency: 'USD'})}</span></div>
                        </div>
                        <div className="mt-6 flex justify-between">
                             <button onClick={() => setStep(0)} className="px-6 py-3 text-slate-700 bg-slate-200 rounded-lg font-semibold shadow-digital">Back</button>
                             <button onClick={handleConfirm} disabled={isProcessing} className="px-6 py-3 text-white bg-green-500 rounded-lg font-semibold shadow-md flex items-center">
                                {isProcessing ? <Icons.SpinnerIcon className="w-5 h-5 mr-2"/> : null}
                                Confirm & Send
                            </button>
                        </div>
                    </>
                )}

                {step === 2 && sentTransaction && (
                    <div className="text-center p-8">
                        <Icons.CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto" />
                        <h3 className="mt-4 text-2xl font-bold text-slate-800">Wire Transfer Submitted!</h3>
                        <p className="text-slate-600 mt-2">Your wire transfer to {sentTransaction.recipient.fullName} is being processed.</p>
                        <p className="font-mono text-xs mt-2">ID: {sentTransaction.id}</p>
                        <button onClick={onClose} className="mt-6 w-full max-w-xs mx-auto py-3 text-white bg-primary rounded-lg font-semibold shadow-md">
                            Done
                        </button>
                    </div>
                )}
            </div>
        </div>
        </>
    );
};
