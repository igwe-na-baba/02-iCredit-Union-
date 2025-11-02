import React, { useState, useEffect } from 'react';
import { Transaction, Account, TransactionStatus } from '../types';
import { USER_PROFILE } from '../constants';
import { LiveTransactionView } from './LiveTransactionView';
import { 
    CheckCircleIcon, 
    ArrowDownTrayIcon, 
    ArrowPathIcon,
    UserCircleIcon,
    ArrowRightIcon,
    BankIcon,
    ClipboardDocumentIcon,
    QrCodeIcon,
    LicensedPartnerIcon,
    DataEncryptionIcon,
    ComplianceIcon,
    SpinnerIcon,
    DocumentCheckIcon,
    ScaleIcon
} from './Icons';
import { AuthorizationWarningModal } from './AuthorizationWarningModal';
import { DownloadableReceipt } from './DownloadableReceipt';

declare const html2canvas: any;
declare const jspdf: any;

interface PaymentReceiptProps {
    transaction: Transaction;
    sourceAccount: Account;
    onStartOver: () => void;
    onViewActivity: () => void;
    onAuthorizeTransaction: (transactionId: string) => void;
    phone?: string;
    onContactSupport: () => void;
}

const DetailRow: React.FC<{ label: string; value: string | React.ReactNode; isMono?: boolean }> = ({ label, value, isMono = false }) => (
    <div className="flex justify-between items-start py-2">
        <p className="text-sm text-slate-400">{label}</p>
        <p className={`text-sm text-slate-200 text-right ${isMono ? 'font-mono' : 'font-semibold'}`}>{value}</p>
    </div>
);

const ComplianceItem: React.FC<{ icon: React.ReactNode; text: string; }> = ({ icon, text }) => (
    <div className="flex items-center space-x-2 text-xs">
        <div className="text-green-400">{icon}</div>
        <span className="text-slate-300">{text}</span>
        <span className="font-bold text-green-400">CLEARED</span>
    </div>
);


export const PaymentReceipt: React.FC<PaymentReceiptProps> = ({ transaction, sourceAccount, onStartOver, onViewActivity, onAuthorizeTransaction, phone, onContactSupport }) => {
    const totalDebited = transaction.sendAmount + transaction.fee;
    const isCredit = transaction.type === 'credit';
    const [showAuthWarning, setShowAuthWarning] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);

    useEffect(() => {
        if (transaction.status === TransactionStatus.FLAGGED_AWAITING_CLEARANCE) {
             const timer = setTimeout(() => {
                setShowAuthWarning(true);
            }, 1000);
            return () => clearTimeout(timer);
        } else {
            setShowAuthWarning(false);
        }
    }, [transaction.status]);

    const handleDownloadReceipt = () => {
        setIsGeneratingPdf(true);
        setTimeout(() => {
            const receiptElement = document.getElementById(`receipt-modal-${transaction.id}`);
            if (receiptElement && typeof html2canvas !== 'undefined' && typeof jspdf !== 'undefined') {
                html2canvas(receiptElement).then((canvas: any) => {
                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jspdf.jsPDF({
                        orientation: 'portrait',
                        unit: 'px',
                        format: [800, canvas.height * (800 / canvas.width)]
                    });
                    pdf.addImage(imgData, 'PNG', 0, 0, 800, canvas.height * (800 / canvas.width));
                    pdf.save(`iCU_Receipt_${transaction.id}.pdf`);
                    setIsGeneratingPdf(false);
                });
            } else {
                console.error('Could not generate PDF. Required elements or libraries are missing.');
                alert('Could not generate PDF at this time.');
                setIsGeneratingPdf(false);
            }
        }, 100);
    };

    return (
        <>
            {showAuthWarning && (
                <AuthorizationWarningModal
                    transactionId={transaction.id}
                    onAuthorize={onAuthorizeTransaction}
                    onClose={() => setShowAuthWarning(false)}
                    onContactSupport={onContactSupport}
                />
            )}
            <div className="absolute inset-0 bg-slate-900 rounded-2xl overflow-hidden -m-6 z-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] animate-grid-pan"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,82,255,0.3),transparent_40%)]"></div>
            </div>
            <div className="relative z-10 text-left space-y-6 animate-fade-in-up">
                {/* Header */}
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4 shadow-inner">
                        <CheckCircleIcon className="w-8 h-8 text-green-300" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-100">Transfer Submitted</h2>
                    <p className="text-slate-400 mt-2">Your funds are being processed. You can track the progress below.</p>
                    <p className="text-xs text-slate-500 mt-4">Reference Number</p>
                    <p className="text-lg font-bold text-white font-mono tracking-widest">{transaction.id}</p>
                </div>

                {/* Live Tracker */}
                <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm">
                    <LiveTransactionView transaction={transaction} phone={phone} />
                </div>

                {/* Transaction Details Card */}
                <div className="bg-black/20 rounded-xl shadow-inner p-6 space-y-4">
                    <div className="flex items-center justify-between text-center">
                        <div className="w-2/5">
                            <UserCircleIcon className="w-10 h-10 mx-auto text-slate-400 mb-1" />
                            <p className="text-xs text-slate-400 uppercase">From</p>
                            <p className="font-semibold text-slate-200 truncate">{USER_PROFILE.name}</p>
                            <p className="text-xs text-slate-400 truncate">{sourceAccount.nickname} ({sourceAccount.accountNumber})</p>
                        </div>
                        <div className="w-1/5">
                            <ArrowRightIcon className="w-6 h-6 text-slate-500" />
                        </div>
                        <div className="w-2/5">
                            <BankIcon className="w-10 h-10 mx-auto text-slate-400 mb-1 p-1.5 border-2 border-slate-500 rounded-full" />
                            <p className="text-xs text-slate-400 uppercase">To</p>
                            <p className="font-semibold text-slate-200 truncate">{transaction.recipient.fullName}</p>
                            <p className="text-xs text-slate-400 truncate">{transaction.recipient.bankName}</p>
                        </div>
                    </div>

                    <div className="border-t border-slate-700 my-4"></div>

                    <div className="divide-y divide-slate-700">
                        <DetailRow label="Total Amount Debited" value={totalDebited.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} isMono />
                        <DetailRow label="Recipient Gets (Est.)" value={transaction.receiveAmount.toLocaleString('en-US', { style: 'currency', currency: transaction.receiveCurrency || transaction.recipient.country.currency })} isMono />
                    </div>
                     <div className="pt-2">
                        <button onClick={() => setIsDetailsExpanded(!isDetailsExpanded)} className="text-xs text-primary-400 hover:underline">
                            {isDetailsExpanded ? 'Hide Full Details' : 'Show Full Details'}
                        </button>
                        {isDetailsExpanded && (
                            <div className="mt-2 divide-y divide-slate-700 border-t border-slate-700 pt-2 animate-fade-in-up">
                                <DetailRow label="Amount Sent" value={transaction.sendAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} isMono />
                                {!isCredit && <DetailRow label="Fee" value={transaction.fee.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} isMono />}
                                {!isCredit && transaction.exchangeRate !== 1 && (
                                    <DetailRow label="Exchange Rate" value={`1 USD = ${transaction.exchangeRate.toFixed(4)} ${transaction.receiveCurrency || transaction.recipient.country.currency}`} isMono />
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* NEW Compliance & Security Section */}
                <div className="bg-black/20 rounded-xl shadow-inner p-6">
                    <h3 className="text-lg font-bold text-slate-200 mb-4">Security & Compliance Checklist</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                        <ComplianceItem icon={<ComplianceIcon className="w-4 h-4" />} text="OFAC Sanctions Screening" />
                        <ComplianceItem icon={<LicensedPartnerIcon className="w-4 h-4" />} text="AML/CTF Protocols" />
                        <ComplianceItem icon={<DataEncryptionIcon className="w-4 h-4" />} text="End-to-End Encryption" />
                        <ComplianceItem icon={<DocumentCheckIcon className="w-4 h-4" />} text="FinCEN Reporting" />
                    </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm font-semibold">
                    <button 
                        onClick={handleDownloadReceipt}
                        disabled={isGeneratingPdf}
                        className="flex items-center justify-center space-x-2 py-3 bg-white/10 text-slate-200 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {isGeneratingPdf ? <SpinnerIcon className="w-5 h-5"/> : <ArrowDownTrayIcon className="w-5 h-5" />}
                        <span>{isGeneratingPdf ? 'Generating...' : 'Download Receipt'}</span>
                    </button>
                    <button onClick={onStartOver} className="flex items-center justify-center space-x-2 py-3 bg-white/10 text-slate-200 hover:bg-white/20 rounded-lg transition-colors">
                        <ArrowPathIcon className="w-5 h-5" />
                        <span>Send Another</span>
                    </button>
                    <button onClick={onViewActivity} className="flex items-center justify-center space-x-2 py-3 bg-white/10 text-slate-200 hover:bg-white/20 rounded-lg transition-colors">
                        <ClipboardDocumentIcon className="w-5 h-5" />
                        <span>View All Activity</span>
                    </button>
                </div>
            </div>

            <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                {isGeneratingPdf && (
                    <div id={`receipt-modal-${transaction.id}`}>
                        <DownloadableReceipt transaction={transaction} />
                    </div>
                )}
            </div>
        </>
    );
};