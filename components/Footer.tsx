import React from 'react';
import { View } from '../types';
import {
    ICreditUnionLogo,
    XSocialIcon,
    LinkedInIcon,
    InstagramIcon,
} from './Icons';

interface FooterProps {
    setActiveView: (view: View) => void;
    onContactSupportClick: () => void;
    onOpenSendMoneyFlow: (initialTab?: 'send' | 'split' | 'deposit') => void;
}

const FooterLink: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
    <li className="group">
        <button onClick={onClick} className="inline-block transition-all duration-200 group-hover:text-primary-300 group-hover:translate-x-1">
            {children}
        </button>
    </li>
);

export const Footer: React.FC<FooterProps> = ({ setActiveView, onContactSupportClick, onOpenSendMoneyFlow }) => {
    
    const handleExternalLink = (url: string) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <footer className="bg-slate-900 text-slate-400">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Global Presence Display */}
                <div className="relative rounded-2xl p-8 bg-slate-800/50 shadow-digital mb-12 h-96 flex flex-col justify-center items-center text-center overflow-hidden">
                    {/* Video Background */}
                     <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute z-0 w-auto min-w-full min-h-full max-w-none opacity-20"
                    >
                        <source src="https://assets.mixkit.co/videos/preview/mixkit-abstract-globe-with-flowing-lines-of-data-42217-large.mp4" type="video/mp4" />
                    </video>
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-slate-900/60 z-10"></div>
                    {/* Text Content */}
                    <div className="relative z-20">
                        <h2 className="text-3xl font-bold text-slate-100 mb-2 glow-text animate-text-focus-in">A Dynamic Global Network</h2>
                        <p className="text-slate-300 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '500ms' }}>
                            Our infrastructure spans the globe, leveraging real-time data and a distributed network to power your finances securely and instantly, wherever you are.
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                    <div className="col-span-2 lg:col-span-1">
                         <div className="flex items-center space-x-2 mb-4">
                            <ICreditUnionLogo />
                            <p className="font-bold text-slate-200">iCredit Union®</p>
                        </div>
                        <p className="text-sm">
                            The new standard in global finance, built on trust, transparency, and technology.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-200 tracking-wider uppercase">Quick Links</h3>
                        <ul className="mt-4 space-y-2 text-sm">
                            <FooterLink onClick={() => setActiveView('dashboard')}>Dashboard</FooterLink>
                            <FooterLink onClick={() => onOpenSendMoneyFlow('send')}>Send Money</FooterLink>
                            <FooterLink onClick={() => setActiveView('cards')}>Cards</FooterLink>
                            <FooterLink onClick={() => setActiveView('history')}>History</FooterLink>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-200 tracking-wider uppercase">Company</h3>
                        <ul className="mt-4 space-y-2 text-sm">
                            <FooterLink onClick={() => handleExternalLink('/#about')}>About Us</FooterLink>
                            <FooterLink onClick={() => setActiveView('security')}>Security Center</FooterLink>
                            <FooterLink onClick={() => handleExternalLink('/#press')}>Press</FooterLink>
                            <FooterLink onClick={onContactSupportClick}>Contact Support</FooterLink>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-200 tracking-wider uppercase">Legal</h3>
                        <ul className="mt-4 space-y-2 text-sm">
                            <FooterLink onClick={() => handleExternalLink('/#terms')}>Terms of Service</FooterLink>
                            <FooterLink onClick={() => setActiveView('privacy')}>Privacy Center</FooterLink>
                            <FooterLink onClick={() => handleExternalLink('/#cookies')}>Cookie Policy</FooterLink>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-200 tracking-wider uppercase">Follow Us</h3>
                        <div className="flex space-x-6 text-slate-400 mt-4">
                            <a href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="X" className="hover:text-white transition-all duration-200 hover:scale-125"><XSocialIcon className="w-5 h-5"/></a>
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-white transition-all duration-200 hover:scale-125"><LinkedInIcon className="w-5 h-5"/></a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-white transition-all duration-200 hover:scale-125"><InstagramIcon className="w-5 h-5"/></a>
                        </div>
                    </div>
                </div>
                <div className="mt-12 border-t border-slate-700 pt-8 text-sm text-center">
                    <p>&copy; {new Date().getFullYear()} iCredit Union®. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};