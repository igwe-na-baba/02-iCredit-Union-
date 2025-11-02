import React from 'react';
import { Transaction } from '../types';
import { ICreditUnionLogo } from './Icons';
import { USER_PROFILE } from '../constants';

interface DownloadableReceiptProps {
  transaction: Transaction;
}

export const DownloadableReceipt: React.FC<DownloadableReceiptProps> = ({ transaction }) => {
    const totalDebited = transaction.sendAmount + transaction.fee;
    const isCompleted = transaction.status === 'Funds Arrived';
    const isCredit = transaction.type === 'credit';

    return (
        <div className="w-[800px] bg-white text-gray-800 p-10 font-sans">
            {/* Header */}
            <div className="flex justify-between items-center border-b-2 border-gray-200 pb-4">
                <div className="flex items-center space-x-3">
                    <ICreditUnionLogo />
                    <h1 className="text-3xl font-bold text-gray-900">iCredit Union®</h1>
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-semibold">Transaction Receipt</h2>
                    <p className="text-sm text-gray-500 font-mono">{transaction.id}</p>
                </div>
            </div>

            {/* Transaction Info */}
            <div className="flex justify-between items-start mt-8">
                <div>
                    <p className="text-gray-500">Date Issued</p>
                    <p className="font-semibold">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="text-right">
                    <p className="text-gray-500">Status</p>
                    <p className={`font-bold text-lg ${isCompleted ? 'text-green-600' : 'text-yellow-600'}`}>{transaction.status}</p>
                </div>
            </div>

            {/* From/To Details */}
            <div className="grid grid-cols-2 gap-8 mt-8">
                <div className="bg-gray-50 p-4 rounded-lg border">
                    <h3 className="font-semibold text-gray-500 border-b pb-2 mb-2">FROM</h3>
                    <p className="font-bold text-lg">{USER_PROFILE.name}</p>
                    <p className="text-sm text-gray-600">iCredit Union® Member</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border">
                    <h3 className="font-semibold text-gray-500 border-b pb-2 mb-2">TO</h3>
                    <p className="font-bold text-lg">{transaction.recipient.fullName}</p>
                    <p className="text-sm text-gray-600">{isCredit ? transaction.description : transaction.recipient.bankName}</p>
                    {!isCredit && <p className="text-sm text-gray-600 font-mono">{transaction.recipient.accountNumber}</p>}
                </div>
            </div>

            {/* Financial Breakdown */}
            <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">Financial Summary</h3>
                <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <tbody className="divide-y">
                            <tr className="bg-gray-50"><td className="p-3 text-gray-600">Amount {isCredit ? 'Deposited' : 'Sent'}</td><td className="p-3 text-right font-mono">{transaction.sendAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td></tr>
                            {!isCredit && <tr><td className="p-3 text-gray-600">Transfer Fee</td><td className="p-3 text-right font-mono">{transaction.fee.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td></tr>}
                            {!isCredit && transaction.exchangeRate !== 1 && (
                                <>
                                <tr><td className="p-3 text-gray-600">Exchange Rate</td><td className="p-3 text-right font-mono">1 USD = {transaction.exchangeRate.toFixed(4)} {transaction.receiveCurrency}</td></tr>
                                <tr className="bg-gray-50"><td className="p-3 text-gray-600">Recipient Receives</td><td className="p-3 text-right font-mono font-bold">{transaction.receiveAmount.toLocaleString('en-US', { style: 'currency', currency: transaction.receiveCurrency })}</td></tr>
                                </>
                            )}
                            <tr className="bg-gray-100 font-bold"><td className="p-4">Total {isCredit ? 'Credited' : 'Debited'}</td><td className="p-4 text-right font-mono text-lg">{totalDebited.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* QR Code and Stamp */}
            <div className="mt-8 flex justify-between items-end">
                 <div className="text-left">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=iCU-Txn-${transaction.id}" alt="Transaction QR Code" className="w-24 h-24" />
                    <p className="text-xs text-gray-500 mt-1">Scan for details</p>
                 </div>
                 <div className="text-center relative w-48 h-24">
                    <img src="https://i.imgur.com/8Q9g2o4.png" alt="Signature" className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-auto mix-blend-darken" />
                    <img src="https://i.imgur.com/eB4kH1g.png" alt="Authorized Stamp" className="absolute -top-4 left-1/2 -translate-x-1/2 w-48 h-auto opacity-80" />
                    <p className="absolute bottom-0 w-full text-xs text-gray-500 border-t-2 border-gray-800 mt-1 pt-1">Authorized Signatory</p>
                 </div>
            </div>

            {/* Footer */}
            <div className="mt-12 border-t-2 border-gray-200 pt-4 text-center text-xs text-gray-500">
                <p>Thank you for banking with iCredit Union®.</p>
                <p>This is an automated receipt and does not require a signature. If you have any questions, please contact our support team.</p>
            </div>
        </div>
    );
};