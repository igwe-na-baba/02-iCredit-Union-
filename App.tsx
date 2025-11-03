// FIX: Import `useMemo` and `useRef` from React to resolve 'Cannot find name' errors.
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { SendMoneyFlow } from './components/SendMoneyFlow';
import { Recipients } from './components/Recipients';
import { Transaction, Recipient, TransactionStatus, Card, Notification, NotificationType, AdvancedTransferLimits, Country, LoanApplication, LoanApplicationStatus, Account, VerificationLevel, CryptoHolding, CryptoAsset, SubscriptionService, AppleCardDetails, AppleCardTransaction, SpendingLimit, SpendingCategory, TravelPlan, TravelPlanStatus, SecuritySettings, TrustedDevice, UserProfile, PlatformSettings, PlatformTheme, View, Task, FlightBooking, UtilityBill, UtilityBiller, AdvisorResponse, BalanceDisplayMode, AccountType, AirtimePurchase, PushNotification, PushNotificationSettings, SavedSession, VirtualCard, WalletDetails, Donation } from './types';
// FIX: Added NEW_USER_ACCOUNTS_TEMPLATE to the import from constants.ts to resolve a reference error.
import { INITIAL_RECIPIENTS, INITIAL_TRANSACTIONS, INITIAL_CARDS, INITIAL_CARD_TRANSACTIONS, INITIAL_ADVANCED_TRANSFER_LIMITS, SELF_RECIPIENT, INITIAL_ACCOUNTS, getInitialCryptoAssets, INITIAL_CRYPTO_HOLDINGS, CRYPTO_TRADE_FEE_PERCENT, INITIAL_SUBSCRIPTIONS, INITIAL_APPLE_CARD_DETAILS, INITIAL_APPLE_CARD_TRANSACTIONS, INITIAL_TRAVEL_PLANS, INITIAL_SECURITY_SETTINGS, INITIAL_TRUSTED_DEVICES, USER_PROFILE, INITIAL_PLATFORM_SETTINGS, THEME_COLORS, INITIAL_TASKS, INITIAL_FLIGHT_BOOKINGS, INITIAL_UTILITY_BILLS, getUtilityBillers, getAirtimeProviders, INITIAL_AIRTIME_PURCHASES, INITIAL_PUSH_SETTINGS, EXCHANGE_RATES, NEW_USER_PROFILE_TEMPLATE, NEW_USER_ACCOUNTS_TEMPLATE, INITIAL_VIRTUAL_CARDS, DOMESTIC_WIRE_FEE, INTERNATIONAL_WIRE_FEE, LEGAL_CONTENT, INITIAL_WALLET_DETAILS } from './constants';
import * as Icons from './components/Icons';
import { Welcome } from './components/Welcome';
import { ActivityLog } from './components/ActivityLog';
import { Security } from './components/Security';
import { CardManagement } from './components/CardManagement';
import { Loans } from './components/Loans';
import { Support } from './components/Support';
import { Accounts } from './components/Accounts';
import { CryptoDashboard } from './components/CryptoDashboard';
import { ServicesDashboard } from './components/ServicesDashboard';
import { LogoutConfirmationModal } from './components/LogoutConfirmationModal';
import { InactivityModal } from './components/InactivityModal';
import { TravelCheckIn } from './components/TravelCheckIn';
import { PlatformFeatures } from './components/PlatformFeatures';
import { DynamicIslandSimulator } from './components/DynamicIslandSimulator';
import { BankingChat } from './components/BankingChat';
// FIX: Corrected import path casing from './components/tasks' to './components/Tasks' to resolve module resolution errors.
import { Tasks } from './components/Tasks';
import { Flights } from './components/Flights';
import { Utilities } from './components/Utilities';
import { Integrations } from './components/Integrations';
import { FinancialAdvisor } from './components/FinancialAdvisor';
// FIX: Added generateFullWelcomeEmail and generateFullWelcomeSms to the import from notificationService.ts to resolve reference errors.
import {
  sendTransactionalEmail,
  generateTransactionReceiptEmail,
  generateNewRecipientEmail,
  generateCardStatusEmail,
  generateFundsArrivedEmail,
  sendSmsNotification,
  generateLoginAlertEmail,
  generateLoginAlertSms,
  generateNewRecipientSms,
  generateTransactionReceiptSms,
  generateWelcomeEmail,
  generateWelcomeSms,
  generateFullWelcomeEmail,
  generateFullWelcomeSms,
  generateDepositConfirmationEmail,
  generateDepositConfirmationSms,
  generateTaskReminderEmail,
  generateTaskReminderSms,
  generateNewAccountOtpEmail,
  generateNewAccountOtpSms,
  generateSupportTicketConfirmationEmail,
  generateSupportTicketConfirmationSms
} from './services/notificationService';
import { getFinancialAnalysis } from './services/geminiService';
import { OpeningSequence } from './components/OpeningSequence';
import { LoggingOut } from './components/LoggingOut';
import { Insurance } from './components/Insurance';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { Investments } from './components/Investments';
import { Footer } from './components/Footer';
import { AtmLocator } from './components/AtmLocator';
import { Quickteller } from './components/Quickteller';
import { QrScanner } from './components/QrScanner';
import { LinkBankAccountModal } from './components/LinkBankAccountModal';
import { PushNotificationToast } from './components/PushNotificationToast';
import { CongratulationsOverlay } from './components/CongratulationsOverlay';
import { ResumeSessionModal } from './components/ResumeSessionModal';
import { ContactSupportModal } from './components/ContactSupportModal';
import { PrivacyCenter } from './components/PrivacyCenter';
import { ProfileSignIn } from './components/ProfileSignIn';
import { AccountCreationFlow } from './components/AccountCreationFlow';
// FIX: Imported the missing LoggedOut component.
import { LoggedOut } from './components/LoggedOut';
import { LanguageProvider } from './contexts/LanguageContext';
import { LanguageSelector } from './components/LanguageSelector';
import { AdvancedFirstPage } from './components/AdvancedFirstPage';
import { WireTransfer } from './components/WireTransfer';
import { About } from './components/About';
import { Contact } from './components/Contact';
import { LegalModal } from './components/LegalModal';
import { DigitalWallet } from './components/DigitalWallet';
import { Ratings } from './components/Ratings';
import { GlobalAid } from './components/GlobalAid';


type AuthStatus = 'intro' | 'initializing' | 'auth' | 'loggedIn' | 'locked' | 'creatingAccount';

const INACTIVITY_WARNING_TIMEOUT = 9 * 60 * 1000; // 9 minutes
const INACTIVITY_MODAL_COUNTDOWN = 60; // 60 seconds

const USER_EMAIL = "randy.m.chitwood@icreditunion.com";
const USER_NAME = "Randy M. Chitwood";
const USER_PHONE = "+1-555-012-1234";

interface SendMoneyFlowState {
  isOpen: boolean;
  initialTab?: 'send' | 'split' | 'deposit';
  transactionToRepeat?: Transaction | null;
}


function AppContent() {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('intro');
  const [balanceDisplayMode, setBalanceDisplayMode] = useState<BalanceDisplayMode>('global');
  const [isNewAccountLogin, setIsNewAccountLogin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [recipients, setRecipients] = useState<Recipient[]>(INITIAL_RECIPIENTS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [cards, setCards] = useState<Card[]>(INITIAL_CARDS);
  const [virtualCards, setVirtualCards] = useState<VirtualCard[]>(INITIAL_VIRTUAL_CARDS);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [advancedTransferLimits, setAdvancedTransferLimits] = useState<AdvancedTransferLimits>(INITIAL_ADVANCED_TRANSFER_LIMITS);
  const [loanApplications, setLoanApplications] = useState<LoanApplication[]>([]);
  const [verificationLevel, setVerificationLevel] = useState<VerificationLevel>(VerificationLevel.UNVERIFIED);
  const [cryptoHoldings, setCryptoHoldings] = useState<CryptoHolding[]>(INITIAL_CRYPTO_HOLDINGS);
  const [cryptoAssets, setCryptoAssets] = useState<CryptoAsset[]>(() => getInitialCryptoAssets(Icons));
  const [subscriptions, setSubscriptions] = useState<SubscriptionService[]>(INITIAL_SUBSCRIPTIONS);
  const [appleCardDetails, setAppleCardDetails] = useState<AppleCardDetails>(INITIAL_APPLE_CARD_DETAILS);
  const [appleCardTransactions, setAppleCardTransactions] = useState<AppleCardTransaction[]>(INITIAL_APPLE_CARD_TRANSACTIONS);
  const [travelPlans, setTravelPlans] = useState<TravelPlan[]>(INITIAL_TRAVEL_PLANS);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(INITIAL_SECURITY_SETTINGS);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(INITIAL_PLATFORM_SETTINGS);
  const [trustedDevices, setTrustedDevices] = useState<TrustedDevice[]>(INITIAL_TRUSTED_DEVICES);
  const [userProfile, setUserProfile] = useState<UserProfile>(USER_PROFILE);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [flightBookings, setFlightBookings] = useState<FlightBooking[]>([]);
  const [utilityBills, setUtilityBills] = useState<UtilityBill[]>(INITIAL_UTILITY_BILLS);
  const utilityBillers = useMemo(() => getUtilityBillers(Icons), []);
  const airtimeProviders = useMemo(() => getAirtimeProviders(Icons), []);
  const [financialAnalysis, setFinancialAnalysis] = useState<AdvisorResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [showInactivityModal, setShowInactivityModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [airtimePurchases, setAirtimePurchases] = useState<AirtimePurchase[]>(INITIAL_AIRTIME_PURCHASES);
  const [sendMoneyFlowState, setSendMoneyFlowState] = useState<SendMoneyFlowState>({ isOpen: false });
  const [isLinkAccountModalOpen, setIsLinkAccountModalOpen] = useState(false);
  const [pushNotification, setPushNotification] = useState<PushNotification | null>(null);
  const [showCongratsOverlay, setShowCongratsOverlay] = useState(false);
  const [savedSession, setSavedSession] = useState<SavedSession | null>(null);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [isContactSupportOpen, setIsContactSupportOpen] = useState(false);
  const [privacySettings, setPrivacySettings] = useState({ ads: true, sharing: true, email: { transactions: true, security: true, promotions: true }, sms: { transactions: true, security: true, promotions: false } });
  const [isLanguageSelectorOpen, setIsLanguageSelectorOpen] = useState(false);
  const [legalModalContent, setLegalModalContent] = useState<{ title: string; content: string } | null>(null);
  const [walletDetails, setWalletDetails] = useState<WalletDetails>(INITIAL_WALLET_DETAILS);
  const [donations, setDonations] = useState<Donation[]>([]);

  const [pushNotificationSettings, setPushNotificationSettings] = useState<PushNotificationSettings>(INITIAL_PUSH_SETTINGS);
  const [linkedServices, setLinkedServices] = useState<Record<string, string>>({});
  const [cardTransactions, setCardTransactions] = useState(INITIAL_CARD_TRANSACTIONS);

  const inactivityTimer = useRef<number | undefined>();
  const inactivityWarningTimer = useRef<number | undefined>();

  const openLegalModal = (title: string, content: string) => {
    setLegalModalContent({ title, content });
  };

  const addNotification = useCallback((type: NotificationType, title: string, message: string, linkTo?: View) => {
    const newNotification: Notification = {
      id: `notif_${Date.now()}`,
      type,
      title,
      message,
      timestamp: new Date(),
      read: false,
      linkTo,
    };
    setNotifications(prev => [newNotification, ...prev]);
    // Also trigger a push notification simulation
    const newPush: PushNotification = { id: newNotification.id, type, title, message };
    setPushNotification(newPush);
  }, []);

  const onUpdatePushNotificationSettings = (update: Partial<PushNotificationSettings>) => {
    setPushNotificationSettings(prev => ({ ...prev, ...update }));
    addNotification(NotificationType.SECURITY, 'Settings Updated', 'Your notification preferences have been saved.');
  };

  const onLinkService = (serviceName: string, identifier: string) => {
    setLinkedServices(prev => ({ ...prev, [serviceName]: identifier }));
    addNotification(NotificationType.ACCOUNT, 'Service Linked', `${serviceName} has been successfully linked to your account.`);
  };

  const resetInactivityTimers = useCallback(() => {
    clearTimeout(inactivityWarningTimer.current);
    clearTimeout(inactivityTimer.current);

    inactivityWarningTimer.current = window.setTimeout(() => {
        setShowInactivityModal(true);
    }, INACTIVITY_WARNING_TIMEOUT);
  }, []);

  const clearInactivityTimers = () => {
    clearTimeout(inactivityWarningTimer.current);
    clearTimeout(inactivityTimer.current);
  };

  useEffect(() => {
    if (authStatus === 'loggedIn') {
      resetInactivityTimers();
      window.addEventListener('mousemove', resetInactivityTimers);
      window.addEventListener('keydown', resetInactivityTimers);
      window.addEventListener('click', resetInactivityTimers);
      window.addEventListener('scroll', resetInactivityTimers);
    } else {
      clearInactivityTimers();
       window.removeEventListener('mousemove', resetInactivityTimers);
       window.removeEventListener('keydown', resetInactivityTimers);
       window.removeEventListener('click', resetInactivityTimers);
       window.removeEventListener('scroll', resetInactivityTimers);
    }

    return () => {
      clearInactivityTimers();
       window.removeEventListener('mousemove', resetInactivityTimers);
       window.removeEventListener('keydown', resetInactivityTimers);
       window.removeEventListener('click', resetInactivityTimers);
       window.removeEventListener('scroll', resetInactivityTimers);
    };
  }, [authStatus, resetInactivityTimers]);

  useEffect(() => {
    // Check for saved session on load
    const saved = localStorage.getItem('icu_session');
    if (saved) {
        setSavedSession(JSON.parse(saved));
        setIsResumeModalOpen(true);
    }
  }, []);

  const handleResumeSession = () => {
    if (savedSession) {
        setActiveView(savedSession.view);
    }
    setIsResumeModalOpen(false);
    setSavedSession(null);
  };

  const handleStartFresh = () => {
    localStorage.removeItem('icu_session');
    setIsResumeModalOpen(false);
    setSavedSession(null);
  };

  const handleLogin = useCallback(() => {
    setAuthStatus('initializing');
    addNotification(NotificationType.SECURITY, 'Successful Login', 'Your account was accessed from a new device.');
    const {subject, body} = generateLoginAlertEmail(USER_NAME);
    sendTransactionalEmail(USER_EMAIL, subject, body);
    sendSmsNotification(USER_PHONE, generateLoginAlertSms());
  }, [addNotification]);
  
  const handleCreateAccountSuccess = (formData: any) => {
    const newUserProfile: UserProfile = { ...NEW_USER_PROFILE_TEMPLATE, ...formData };
    const newAccounts = NEW_USER_ACCOUNTS_TEMPLATE.map(acc => ({
        ...acc,
        id: `acc_${Date.now()}_${Math.random()}`,
        fullAccountNumber: Math.random().toString().slice(2, 18),
    }));
    setUserProfile(newUserProfile);
    setAccounts(newAccounts);
    setAuthStatus('initializing');
    setIsNewAccountLogin(true);

    const { subject, body } = generateFullWelcomeEmail(newUserProfile.name, newAccounts.map(a => ({ type: a.type, number: a.accountNumber })));
    sendTransactionalEmail(newUserProfile.email, subject, body);
    sendSmsNotification(newUserProfile.phone!, generateFullWelcomeSms(newUserProfile.name));
  };


  const handleLogout = () => {
    setIsLogoutModalOpen(false);
    setShowInactivityModal(false);
    setIsLoggingOut(true);
    
    // Save session before logging out
    localStorage.setItem('icu_session', JSON.stringify({ view: activeView, timestamp: Date.now() }));

    setTimeout(() => {
        setIsLoggingOut(false);
        setAuthStatus('locked');
        setActiveView('dashboard');
    }, 8000); // Duration of the logging out animation
  };
  
  const handleFinalLogout = () => {
      localStorage.removeItem('icu_session');
      setAuthStatus('auth');
  };

  const handleStayLoggedIn = () => {
    setShowInactivityModal(false);
    resetInactivityTimers();
  };

  const createTransaction = (transactionData: Omit<Transaction, 'id' | 'status' | 'estimatedArrival' | 'statusTimestamps'| 'type'>): Transaction | null => {
    const sourceAccount = accounts.find(acc => acc.id === transactionData.accountId);
    if (!sourceAccount) return null;
    
    const totalCost = transactionData.sendAmount + transactionData.fee;
    // For external accounts, we assume the balance is sufficient and don't check it locally
    if (sourceAccount.type !== AccountType.EXTERNAL_LINKED && sourceAccount.balance < totalCost) {
        console.error("Insufficient funds");
        return null;
    }
    
    const newTransaction: Transaction = {
      ...transactionData,
      id: `txn_${Date.now()}`,
      status: TransactionStatus.SUBMITTED,
      estimatedArrival: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      statusTimestamps: {
        [TransactionStatus.SUBMITTED]: new Date(),
      },
      type: 'debit',
    };
    
    setTransactions(prev => [newTransaction, ...prev]);

    // Update account balance only for internal accounts
    if (sourceAccount.type !== AccountType.EXTERNAL_LINKED) {
      setAccounts(prev => prev.map(acc => 
        acc.id === transactionData.accountId ? { ...acc, balance: acc.balance - totalCost } : acc
      ));
    }
    
    addNotification(
        NotificationType.TRANSACTION,
        `Transfer Submitted`,
        `Your transfer of ${transactionData.sendAmount.toLocaleString('en-US', {style:'currency', currency:'USD'})} to ${transactionData.recipient.fullName} has been submitted.`
    );
    
    const {subject, body} = generateTransactionReceiptEmail(newTransaction, USER_NAME);
    sendTransactionalEmail(USER_EMAIL, subject, body);
    sendSmsNotification(USER_PHONE, generateTransactionReceiptSms(newTransaction));

    return newTransaction;
  };
  
  const handleSendWire = (data: any): Transaction | null => {
    const sourceAccount = accounts.find(acc => acc.id === data.sourceAccountId);
    if (!sourceAccount) return null;

    const fee = data.transferType === 'international' ? INTERNATIONAL_WIRE_FEE : DOMESTIC_WIRE_FEE;
    const totalCost = data.amount + fee;

    if (sourceAccount.type !== AccountType.EXTERNAL_LINKED && sourceAccount.balance < totalCost) {
      console.error("Insufficient funds for wire transfer");
      return null;
    }

    const newRecipient: Recipient = {
        id: `rec_wire_${Date.now()}`,
        fullName: data.recipientName,
        bankName: data.bankName,
        accountNumber: `****${data.accountNumber.slice(-4)}`,
        country: data.recipientCountry,
        streetAddress: data.recipientAddress,
        city: data.recipientCity,
        stateProvince: data.recipientState,
        postalCode: data.recipientPostalCode,
        deliveryOptions: { bankDeposit: true, cardDeposit: false, cashPickup: false },
        realDetails: { accountNumber: data.accountNumber, swiftBic: data.swiftBic },
    };

    const newTransaction: Transaction = {
        id: `txn_wire_${Date.now()}`,
        accountId: sourceAccount.id,
        recipient: newRecipient,
        sendAmount: data.amount,
        receiveAmount: data.amount * (EXCHANGE_RATES[data.recipientCountry.currency] || 1),
        receiveCurrency: data.recipientCountry.currency,
        fee: fee,
        exchangeRate: EXCHANGE_RATES[data.recipientCountry.currency] || 1,
        status: TransactionStatus.SUBMITTED,
        estimatedArrival: new Date(Date.now() + (data.transferType === 'international' ? 5 : 1) * 24 * 60 * 60 * 1000),
        statusTimestamps: { [TransactionStatus.SUBMITTED]: new Date() },
        description: `Wire Transfer to ${data.recipientName}`,
        type: 'debit',
        purpose: data.purpose,
        transferMethod: 'wire',
    };

    setTransactions(prev => [newTransaction, ...prev]);

    if (sourceAccount.type !== AccountType.EXTERNAL_LINKED) {
      setAccounts(prev => prev.map(acc => 
        acc.id === data.sourceAccountId ? { ...acc, balance: acc.balance - totalCost } : acc
      ));
    }
    
    addNotification(
        NotificationType.TRANSACTION,
        `Wire Transfer Submitted`,
        `Your wire transfer of ${data.amount.toLocaleString('en-US', {style:'currency', currency:'USD'})} to ${data.recipientName} is processing.`
    );
    
    return newTransaction;
  };

  const addRecipient = (data: { fullName: string, nickname?: string, phone?: string, bankName: string, accountNumber: string, swiftBic: string, country: Country, cashPickupEnabled: boolean, streetAddress: string, city: string, stateProvince: string, postalCode: string }) => {
    const newRecipient: Recipient = {
      id: `rec_${Date.now()}`,
      fullName: data.fullName,
      nickname: data.nickname,
      phone: data.phone,
      bankName: data.bankName,
      accountNumber: `**** **** **** ${data.accountNumber.slice(-4)}`,
      country: data.country,
      streetAddress: data.streetAddress,
      city: data.city,
      stateProvince: data.stateProvince,
      postalCode: data.postalCode,
      deliveryOptions: {
        bankDeposit: true,
        cardDeposit: true,
        cashPickup: data.cashPickupEnabled,
      },
      realDetails: {
        accountNumber: data.accountNumber,
        swiftBic: data.swiftBic,
      }
    };
    setRecipients(prev => [newRecipient, ...prev]);
    addNotification(NotificationType.SECURITY, 'New Recipient Added', `You've successfully added ${data.fullName} to your recipients.`);
    const {subject, body} = generateNewRecipientEmail(USER_NAME, data.fullName);
    sendTransactionalEmail(USER_EMAIL, subject, body);
    sendSmsNotification(USER_PHONE, generateNewRecipientSms(data.fullName));
  };
  
  const onUpdateRecipient = (recipientId: string, data: any) => {
      setRecipients(prev => prev.map(r => r.id === recipientId ? { ...r, ...data, accountNumber: `**** **** **** ${data.accountNumber.slice(-4)}`, realDetails: { accountNumber: data.accountNumber, swiftBic: data.swiftBic } } : r));
      addNotification(NotificationType.SECURITY, 'Recipient Updated', `Details for ${data.fullName} have been updated.`);
  };

  const handleDonate = (causeId: string, amount: number, sourceAccountId: string): boolean => {
      const sourceAccount = accounts.find(acc => acc.id === sourceAccountId);
      if (!sourceAccount || sourceAccount.balance < amount) {
          addNotification(NotificationType.TRANSACTION, 'Donation Failed', 'Insufficient funds in the selected account.');
          return false;
      }
      const newDonation: Donation = {
          id: `don_${Date.now()}`,
          causeId,
          amount,
          date: new Date(),
      };
      setDonations(prev => [...prev, newDonation]);
      setAccounts(prev => prev.map(acc => acc.id === sourceAccountId ? { ...acc, balance: acc.balance - amount } : acc));
      addNotification(NotificationType.TRANSACTION, 'Donation Successful', `Thank you for your generous donation of ${amount.toLocaleString('en-US', {style:'currency', currency:'USD'})}.`);
      return true;
  };

  useEffect(() => {
    const root = document.documentElement;
    const theme = THEME_COLORS[platformSettings.theme];
    for (const key in theme) {
      root.style.setProperty(`--color-primary-${key}`, theme[key as keyof typeof theme]);
    }
  }, [platformSettings.theme]);

  const runFinancialAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    setAnalysisError(false);
    const data = JSON.stringify({
        accounts,
        transactions,
        cryptoHoldings,
    });
    const result = await getFinancialAnalysis(data);
    if (result.isError) {
        setAnalysisError(true);
    } else {
        setFinancialAnalysis(result.analysis);
    }
    setIsAnalyzing(false);
  }, [accounts, transactions, cryptoHoldings]);

  const onUpdateCardControls = (cardId: string, updatedControls: Partial<Card['controls']>) => {
    setCards(prev => prev.map(c => {
        if (c.id === cardId) {
            const newControls = { ...c.controls, ...updatedControls };
            if (c.controls.isFrozen !== newControls.isFrozen) {
                const status = newControls.isFrozen ? 'frozen' : 'unfrozen';
                addNotification(NotificationType.CARD, `Card ${status}`, `Your card ending in ${c.lastFour} has been ${status}.`);
                 const {subject, body} = generateCardStatusEmail(USER_NAME, newControls.isFrozen, c.lastFour);
                 sendTransactionalEmail(USER_EMAIL, subject, body);
            }
            return { ...c, controls: newControls };
        }
        return c;
    }));
  };
  
   const onAddCard = (cardData: Omit<Card, 'id' | 'controls'>) => {
    const newCard: Card = {
      ...cardData,
      id: `card_${Date.now()}`,
      controls: { isFrozen: false, onlinePurchases: true, internationalTransactions: true },
    };
    setCards(prev => [...prev, newCard]);
     addNotification(NotificationType.CARD, 'New Card Added', `A new card ending in ${cardData.lastFour} was successfully added.`);
  };
  
  const onAddFunds = (amount: number, cardLastFour: string, cardNetwork: 'Visa' | 'Mastercard') => {
    setAccounts(prev => prev.map(acc => acc.id === 'acc_checking_1' ? {...acc, balance: acc.balance + amount} : acc));
     addNotification(NotificationType.TRANSACTION, 'Funds Added', `${amount.toLocaleString('en-US', {style: 'currency', currency: 'USD'})} was added from card ending in ${cardLastFour}.`);
    const {subject, body} = generateDepositConfirmationEmail(USER_NAME, amount, cardLastFour);
    sendTransactionalEmail(USER_EMAIL, subject, body);
    sendSmsNotification(USER_PHONE, generateDepositConfirmationSms(amount, cardLastFour));
  };
  
  const addLoanApplication = (application: Omit<LoanApplication, 'id' | 'status' | 'submittedDate'>) => {
    const newApplication: LoanApplication = {
      ...application,
      id: `loan_app_${Date.now()}`,
      status: LoanApplicationStatus.PENDING,
      submittedDate: new Date(),
    };
    setLoanApplications(prev => [newApplication, ...prev]);
  };
  
  const onVerificationComplete = (level: VerificationLevel) => {
    setVerificationLevel(level);
    if(level !== VerificationLevel.UNVERIFIED){
        addNotification(NotificationType.SECURITY, 'Verification Complete', `You are now verified at ${level}.`);
    }
  };

   const onUpdateSecuritySettings = (newSettings: Partial<SecuritySettings>) => {
    setSecuritySettings(prev => ({ ...prev, ...newSettings }));
  };

  const onRevokeDevice = (deviceId: string) => {
    setTrustedDevices(prev => prev.filter(d => d.id !== deviceId));
  };
  
   const onUpdateProfilePicture = (url: string) => {
    setUserProfile(prev => ({ ...prev, profilePictureUrl: url }));
  };

  const handleAuthorizeTransaction = (transactionId: string) => {
    setTransactions(prev => prev.map(t => t.id === transactionId ? {
        ...t,
        status: TransactionStatus.IN_TRANSIT,
        statusTimestamps: { ...t.statusTimestamps, [TransactionStatus.IN_TRANSIT]: new Date() }
    } : t));
    setShowCongratsOverlay(true);
    setTimeout(() => setShowCongratsOverlay(false), 4000);
  };

  const onDepositCheck = (details: { amount: number, accountId: string, images: { front: string, back: string } }) => {
    // 1. Create a new transaction
     const newTransaction: Transaction = {
      id: `txn_check_${Date.now()}`,
      accountId: details.accountId,
      recipient: SELF_RECIPIENT, // Depositing to self
      sendAmount: details.amount,
      receiveAmount: details.amount,
      fee: 0,
      exchangeRate: 1,
      status: TransactionStatus.PENDING_DEPOSIT,
      estimatedArrival: new Date(Date.now() + 2 * 86400000), // ~2 business days
      statusTimestamps: {
        [TransactionStatus.SUBMITTED]: new Date(),
        [TransactionStatus.PENDING_DEPOSIT]: new Date(),
      },
      description: `Mobile Check Deposit`,
      type: 'credit',
      purpose: 'Pay by Check',
      chequeDetails: { images: details.images }
    };
    setTransactions(prev => [newTransaction, ...prev]);

    // 2. Update account balance (can be done later after 'approval')
    // For demo, we update immediately
    setAccounts(prev => prev.map(acc => acc.id === details.accountId ? {...acc, balance: acc.balance + details.amount} : acc));

    // 3. Close the modal
    setSendMoneyFlowState({ isOpen: false });

    // 4. Send notifications
     addNotification(NotificationType.TRANSACTION, 'Check Deposit Submitted', `Your check for ${details.amount.toLocaleString('en-US', {style: 'currency', currency: 'USD'})} is being processed.`);
  };
  
  const onSplitTransaction = (details: { sourceAccountId: string; splits: { recipient: Recipient; amount: number }[]; totalAmount: number; purpose: string; }): boolean => {
    const sourceAccount = accounts.find(acc => acc.id === details.sourceAccountId);
    if (!sourceAccount || sourceAccount.balance < details.totalAmount) return false;

    details.splits.forEach(split => {
         const exchangeRate = EXCHANGE_RATES[split.recipient.country.currency] || 1;
         createTransaction({
            accountId: details.sourceAccountId,
            recipient: split.recipient,
            sendAmount: split.amount,
            receiveAmount: split.amount * exchangeRate,
            fee: 0, // Assume no fee for split for simplicity
            exchangeRate: exchangeRate,
            description: `Split payment`,
            purpose: details.purpose,
            splitGroupId: `split_${Date.now()}`
        });
    });
    // The balance will be updated inside createTransaction, but we do it again just in case (as it's split)
    setAccounts(prev => prev.map(acc => acc.id === details.sourceAccountId ? { ...acc, balance: acc.balance - details.totalAmount } : acc));
    return true;
  };

  const onOpenSendMoneyFlow = (initialTab?: 'send' | 'split' | 'deposit', transactionToRepeat: Transaction | null = null) => {
    setSendMoneyFlowState({ isOpen: true, initialTab: initialTab || 'send', transactionToRepeat });
  };
  
  const handleRepeatTransaction = (transaction: Transaction) => {
    onOpenSendMoneyFlow('send', transaction);
  };
  
  const onLinkAccount = () => {
      setSendMoneyFlowState({ isOpen: false });
      setIsLinkAccountModalOpen(true);
  };
  
  const onLinkAccountSuccess = (bankName: string, accountName: string, lastFour: string) => {
      const newAccount: Account = {
          id: `ext_${Date.now()}`,
          type: AccountType.EXTERNAL_LINKED,
          nickname: `${bankName} (${lastFour})`,
          accountNumber: `**** ${lastFour}`,
          balance: 0, // Not tracked for external accounts
          features: [],
          status: 'Active',
      };
      setAccounts(prev => [...prev, newAccount]);
      setIsLinkAccountModalOpen(false);
      setSendMoneyFlowState({ isOpen: true });
      addNotification(NotificationType.ACCOUNT, 'Account Linked', `You've successfully linked your ${bankName} account.`);
  };
  
  const onContactSupport = async (data: { topic: string; transactionId?: string; message: string }) => {
    const ticketId = `ICU-${Math.floor(Math.random() * 900000) + 100000}`;
    const { subject, body } = generateSupportTicketConfirmationEmail(userProfile.name, ticketId, data.topic);
    await sendTransactionalEmail(userProfile.email, subject, body);
    await sendSmsNotification(userProfile.phone!, generateSupportTicketConfirmationSms(ticketId));
    addNotification(NotificationType.SUPPORT, "Support Ticket Created", `Your ticket #${ticketId} has been received. We will respond shortly.`);
  };
  

  const totalNetWorth = useMemo(() => accounts.reduce((sum, acc) => sum + acc.balance, 0), [accounts]);
  const checkingAccount = useMemo(() => accounts.find(acc => acc.type === 'Global Checking'), [accounts]);
  
  const cryptoPortfolioValue = useMemo(() => {
    return cryptoHoldings.reduce((total, holding) => {
        const asset = cryptoAssets.find(a => a.id === holding.assetId);
        return total + (asset ? holding.amount * asset.price : 0);
    }, 0);
  }, [cryptoHoldings, cryptoAssets]);
  
  const portfolioChange24h = useMemo(() => {
     const currentValue = cryptoPortfolioValue;
     const previousValue = cryptoHoldings.reduce((total, holding) => {
        const asset = cryptoAssets.find(a => a.id === holding.assetId);
        if(!asset) return total;
        // Approximate previous price
        const previousPrice = asset.price / (1 + (asset.change24h / 100));
        return total + (holding.amount * previousPrice);
     }, 0);

     if(previousValue === 0) return 0;
     return ((currentValue - previousValue) / previousValue) * 100;
  }, [cryptoPortfolioValue, cryptoHoldings, cryptoAssets]);
  
  
  if (authStatus === 'intro') {
    return <AdvancedFirstPage onComplete={() => setAuthStatus('auth')} />;
  }
  
  if (authStatus === 'auth') {
    return <Welcome onLogin={handleLogin} onStartCreateAccount={() => setAuthStatus('creatingAccount')} />;
  }
  
   if (authStatus === 'creatingAccount') {
    return <AccountCreationFlow onBackToLogin={() => setAuthStatus('auth')} onCreateAccountSuccess={handleCreateAccountSuccess} />;
  }

  if (authStatus === 'locked') {
    return <LoggedOut user={userProfile} onLogin={() => setAuthStatus('auth')} onSwitchUser={handleFinalLogout} />;
  }

  if (authStatus === 'initializing') {
    return <OpeningSequence onComplete={() => setAuthStatus('loggedIn')} />;
  }

  if (isLoggingOut) {
    return <LoggingOut onComplete={handleLogout} />;
  }
  
  const activeTransactionForIsland = transactions.find(t => 
    t.type === 'debit' && 
    t.status !== TransactionStatus.FUNDS_ARRIVED && 
    t.status !== TransactionStatus.FLAGGED_AWAITING_CLEARANCE
  );

  const isDashboard = activeView === 'dashboard';

  // FIX: Added missing views ('send', 'wire', 'about', 'contact', 'wallet', 'ratings', 'globalAid') to the viewMap to satisfy the 'View' type and resolve the compile error.
  const viewMap: { [key in View]: React.ReactNode } = {
    dashboard: <Dashboard 
        accounts={accounts} 
        transactions={transactions} 
        setActiveView={setActiveView} 
        recipients={recipients} 
        createTransaction={createTransaction}
        cryptoPortfolioValue={cryptoPortfolioValue}
        portfolioChange24h={portfolioChange24h}
        travelPlans={travelPlans}
        totalNetWorth={totalNetWorth}
        balanceDisplayMode={balanceDisplayMode}
        userProfile={userProfile}
        onOpenSendMoneyFlow={onOpenSendMoneyFlow}
    />,
    send: null, // 'send' view is handled by the SendMoneyFlow modal, not as a main view.
    recipients: <Recipients recipients={recipients} addRecipient={addRecipient} onUpdateRecipient={onUpdateRecipient} />,
    history: <ActivityLog transactions={transactions} onUpdateTransactions={(ids, updates) => setTransactions(prev => prev.map(t => ids.includes(t.id) ? {...t, ...updates} : t))} onRepeatTransaction={handleRepeatTransaction} />,
    security: <Security 
        advancedTransferLimits={advancedTransferLimits}
        onUpdateAdvancedLimits={setAdvancedTransferLimits}
        cards={cards}
        onUpdateCardControls={onUpdateCardControls}
        verificationLevel={verificationLevel}
        onVerificationComplete={onVerificationComplete}
        securitySettings={securitySettings}
        onUpdateSecuritySettings={onUpdateSecuritySettings}
        trustedDevices={trustedDevices}
        onRevokeDevice={onRevokeDevice}
        onChangePassword={() => setIsChangePasswordModalOpen(true)}
        transactions={transactions}
        pushNotificationSettings={pushNotificationSettings}
        onUpdatePushNotificationSettings={onUpdatePushNotificationSettings}
        userProfile={userProfile}
        onUpdateProfilePicture={onUpdateProfilePicture}
    />,
    cards: <CardManagement 
        cards={cards} 
        cardTransactions={cardTransactions} 
        onUpdateCardControls={onUpdateCardControls}
        onAddCard={onAddCard}
        accountBalance={checkingAccount?.balance || 0}
        onAddFunds={onAddFunds}
    />,
    loans: <Loans loanApplications={loanApplications} addLoanApplication={addLoanApplication} addNotification={addNotification} />,
    insurance: <Insurance addNotification={addNotification} />,
    support: <Support />,
    accounts: <Accounts accounts={accounts} transactions={transactions} verificationLevel={verificationLevel} onUpdateAccountNickname={(id, nick) => setAccounts(prev => prev.map(a => a.id === id ? {...a, nickname: nick} : a))} />,
    crypto: <CryptoDashboard 
      cryptoAssets={cryptoAssets} 
      setCryptoAssets={setCryptoAssets} 
      holdings={cryptoHoldings} 
      checkingAccount={checkingAccount}
      onBuy={(assetId, usdAmount, assetPrice) => {
        if(!checkingAccount || checkingAccount.balance < usdAmount) return false;
        const cryptoAmount = usdAmount / assetPrice;
        setAccounts(prev => prev.map(a => a.id === checkingAccount.id ? {...a, balance: a.balance - usdAmount} : a));
        setCryptoHoldings(prev => {
            const existing = prev.find(h => h.assetId === assetId);
            if(existing){
                const totalAmount = existing.amount + cryptoAmount;
                const totalCost = (existing.avgBuyPrice * existing.amount) + usdAmount;
                return prev.map(h => h.assetId === assetId ? {...h, amount: totalAmount, avgBuyPrice: totalCost / totalAmount} : h);
            }
            return [...prev, {assetId, amount: cryptoAmount, avgBuyPrice: assetPrice}];
        });
        return true;
      }}
      onSell={(assetId, cryptoAmount, assetPrice) => {
          const holding = cryptoHoldings.find(h => h.assetId === assetId);
          if(!holding || holding.amount < cryptoAmount) return false;
          const usdAmount = cryptoAmount * assetPrice;
          setAccounts(prev => prev.map(a => a.id === checkingAccount?.id ? {...a, balance: a.balance + usdAmount} : a));
          setCryptoHoldings(prev => prev.map(h => h.assetId === assetId ? {...h, amount: h.amount - cryptoAmount} : h).filter(h => h.amount > 0.000001));
          return true;
      }}
    />,
    services: <ServicesDashboard 
      subscriptions={subscriptions}
      appleCardDetails={appleCardDetails}
      appleCardTransactions={appleCardTransactions}
      onPaySubscription={(subId) => {
        const sub = subscriptions.find(s => s.id === subId);
        const acc = accounts.find(a => a.type === AccountType.CHECKING);
        if (sub && acc && acc.balance >= sub.amount) {
          setAccounts(prev => prev.map(a => a.id === acc.id ? {...a, balance: a.balance - sub.amount} : a));
          setSubscriptions(prev => prev.map(s => s.id === subId ? {...s, isPaid: true} : s));
          return true;
        }
        return false;
      }}
      onUpdateSpendingLimits={(limits) => setAppleCardDetails(prev => ({...prev, spendingLimits: limits}))}
      onUpdateTransactionCategory={(txId, cat) => setAppleCardTransactions(prev => prev.map(tx => tx.id === txId ? {...tx, category: cat} : tx))}
    />,
    checkin: <TravelCheckIn travelPlans={travelPlans} addTravelPlan={(country, startDate, endDate) => {
      const newPlan: TravelPlan = {
        id: `tp_${Date.now()}`,
        country,
        startDate,
        endDate,
        status: new Date() >= startDate && new Date() <= endDate ? TravelPlanStatus.ACTIVE : TravelPlanStatus.UPCOMING,
      };
      setTravelPlans(prev => [newPlan, ...prev]);
    }}/>,
    platform: <PlatformFeatures settings={platformSettings} onUpdateSettings={(newSettings) => setPlatformSettings(prev => ({ ...prev, ...newSettings }))} />,
    tasks: <Tasks 
        tasks={tasks}
        addTask={(text, dueDate) => {
            const newTask: Task = { id: `task_${Date.now()}`, text, completed: false, dueDate };
            setTasks(prev => [newTask, ...prev]);
        }}
        toggleTask={(id) => setTasks(prev => prev.map(t => t.id === id ? {...t, completed: !t.completed} : t))}
        deleteTask={(id) => setTasks(prev => prev.filter(t => t.id !== id))}
    />,
    flights: <Flights 
        bookings={flightBookings}
        onBookFlight={(booking, sourceAccountId) => {
            const acc = accounts.find(a => a.id === sourceAccountId);
            if (acc && acc.balance >= booking.totalPrice) {
                const newBooking: FlightBooking = { ...booking, id: `book_${Date.now()}`, bookingDate: new Date(), status: 'Confirmed' };
                setFlightBookings(prev => [newBooking, ...prev]);
                setAccounts(prev => prev.map(a => a.id === sourceAccountId ? {...a, balance: a.balance - booking.totalPrice} : a));
                return true;
            }
            return false;
        }}
        accounts={accounts}
        setActiveView={setActiveView}
    />,
    utilities: <Utilities 
      bills={utilityBills} 
      billers={utilityBillers} 
      accounts={accounts} 
      setActiveView={setActiveView}
      onPayBill={(billId, sourceAccountId) => {
        const bill = utilityBills.find(b => b.id === billId);
        const acc = accounts.find(a => a.id === sourceAccountId);
        if (bill && acc && acc.balance >= bill.amount) {
          setUtilityBills(prev => prev.map(b => b.id === billId ? {...b, isPaid: true} : b));
          setAccounts(prev => prev.map(a => a.id === sourceAccountId ? {...a, balance: a.balance - bill.amount} : a));
          return true;
        }
        return false;
      }} 
    />,
    integrations: <Integrations linkedServices={linkedServices} onLinkService={onLinkService} />,
    advisor: <FinancialAdvisor 
      analysis={financialAnalysis} 
      isAnalyzing={isAnalyzing} 
      analysisError={analysisError} 
      // FIX: Corrected prop name from `runAnalysis` to `runFinancialAnalysis`
      runFinancialAnalysis={runFinancialAnalysis}
      setActiveView={setActiveView}
    />,
    invest: <Investments />,
    atmLocator: <AtmLocator />,
    quickteller: <Quickteller
      airtimeProviders={airtimeProviders}
      purchases={airtimePurchases}
      accounts={accounts}
      setActiveView={setActiveView}
      onPurchase={(providerId, phoneNumber, amount, accountId) => {
        const acc = accounts.find(a => a.id === accountId);
        if (acc && acc.balance >= amount) {
            const newPurchase: AirtimePurchase = { id: `air_${Date.now()}`, providerId, phoneNumber, amount, purchaseDate: new Date() };
            setAirtimePurchases(prev => [newPurchase, ...prev]);
            setAccounts(prev => prev.map(a => a.id === accountId ? {...a, balance: a.balance - amount} : a));
            return true;
        }
        return false;
      }}
    />,
    qrScanner: <QrScanner hapticsEnabled={platformSettings.hapticsEnabled} />,
    privacy: <PrivacyCenter settings={privacySettings} onUpdateSettings={(update) => {
        setPrivacySettings(prev => ({...prev, ...update}));
        addNotification(NotificationType.SECURITY, 'Privacy Settings Updated', 'Your preferences have been saved.');
    }} />,
    wire: <WireTransfer accounts={accounts} recipients={recipients} onSendWire={handleSendWire} onClose={() => setActiveView('dashboard')} />,
    about: <About />,
    contact: <Contact setActiveView={setActiveView} />,
    wallet: <DigitalWallet wallet={walletDetails} />,
    ratings: <Ratings />,
    globalAid: <GlobalAid donations={donations} onDonate={handleDonate} accounts={accounts} />,
  };

  return (
    <div className="bg-slate-100 min-h-screen">
        <Header 
          onMenuToggle={() => setIsMenuOpen(!isMenuOpen)} 
          isMenuOpen={isMenuOpen}
          activeView={activeView}
          setActiveView={setActiveView}
          onLogout={() => setIsLogoutModalOpen(true)}
          notifications={notifications}
          onMarkNotificationsAsRead={() => setNotifications(prev => prev.map(n => ({...n, read: true})))}
          onNotificationClick={(view) => setActiveView(view)}
          userProfile={userProfile}
          onOpenLanguageSelector={() => setIsLanguageSelectorOpen(true)}
          onOpenSendMoneyFlow={onOpenSendMoneyFlow}
        />
        
        <DynamicIslandSimulator transaction={activeTransactionForIsland} />
        <main className={`p-4 sm:p-6 lg:p-8 transition-opacity duration-300 ${isMenuOpen ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            <div 
                className={`bg-white/50 backdrop-blur-3xl rounded-3xl shadow-2xl p-6 min-h-[calc(100vh-8rem)] ${isDashboard ? 'bg-transparent shadow-none backdrop-blur-none' : ''}`}
            >
                {viewMap[activeView]}
            </div>
        </main>
        
        <Footer 
          setActiveView={setActiveView} 
          onOpenSendMoneyFlow={onOpenSendMoneyFlow} 
          openLegalModal={openLegalModal} 
        />
        <BankingChat />
        
        {sendMoneyFlowState.isOpen && (
            <SendMoneyFlow 
                recipients={recipients} 
                accounts={accounts} 
                createTransaction={createTransaction}
                transactions={transactions}
                securitySettings={securitySettings}
                hapticsEnabled={platformSettings.hapticsEnabled}
                onAuthorizeTransaction={handleAuthorizeTransaction}
                setActiveView={setActiveView}
                onClose={() => setSendMoneyFlowState({ isOpen: false })}
                onLinkAccount={onLinkAccount}
                onDepositCheck={onDepositCheck}
                onSplitTransaction={onSplitTransaction}
                initialTab={sendMoneyFlowState.initialTab}
                transactionToRepeat={sendMoneyFlowState.transactionToRepeat}
                userProfile={userProfile}
                onContactSupport={() => setIsContactSupportOpen(true)}
            />
        )}
        {isLogoutModalOpen && <LogoutConfirmationModal onClose={() => setIsLogoutModalOpen(false)} onConfirm={handleLogout} />}
        {showInactivityModal && <InactivityModal onStayLoggedIn={handleStayLoggedIn} onLogout={handleLogout} countdownStart={INACTIVITY_MODAL_COUNTDOWN} />}
        {isChangePasswordModalOpen && <ChangePasswordModal onClose={() => setIsChangePasswordModalOpen(false)} onSuccess={() => addNotification(NotificationType.SECURITY, 'Password Changed', 'Your password has been successfully updated.')}/>}
        {isLinkAccountModalOpen && <LinkBankAccountModal onClose={() => setIsLinkAccountModalOpen(false)} onLinkSuccess={onLinkAccountSuccess} />}
        {pushNotification && <PushNotificationToast notification={pushNotification} onClose={() => setPushNotification(null)} />}
        {showCongratsOverlay && <CongratulationsOverlay />}
        {isResumeModalOpen && savedSession && <ResumeSessionModal session={savedSession} onResume={handleResumeSession} onStartFresh={handleStartFresh} />}
        {isContactSupportOpen && <ContactSupportModal onClose={() => setIsContactSupportOpen(false)} onSubmit={onContactSupport} transactions={transactions} />}
        {isLanguageSelectorOpen && <LanguageSelector onClose={() => setIsLanguageSelectorOpen(false)} />}
        {legalModalContent && <LegalModal title={legalModalContent.title} content={legalModalContent.content} onClose={() => setLegalModalContent(null)} />}
    </div>
  );
}

// FIX: Added a default export for the App component, wrapping the main content with the LanguageProvider. This resolves the import error in index.tsx.
function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
