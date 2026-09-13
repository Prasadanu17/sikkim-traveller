import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CreditCard,
  Smartphone,
  Building,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Lock,
  ArrowRight
} from "lucide-react";

import { createPaymentIntent, verifyPayment } from "../../services/financial/financialPaymentService";
import { validatePaymentAmount } from "../../services/financial/financialValidationService";

const PAYMENT_METHODS = [
  { id: "UPI", label: "UPI Instant (GPay / PhonePe / Paytm)", icon: Smartphone },
  { id: "CREDIT_CARD", label: "Credit / Debit Card", icon: CreditCard },
  { id: "NET_BANKING", label: "Net Banking (All Indian Banks)", icon: Building }
];

export default function CustomerPaymentModal({
  isOpen,
  onClose,
  booking,
  invoice,
  initialAmount = 0,
  paymentType = "ADVANCE",
  onSuccess
}) {
  const [amount, setAmount] = useState(initialAmount.toString());
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [payerName, setPayerName] = useState(booking?.customer?.firstName || "Traveler");
  const [payerContact, setPayerContact] = useState(booking?.customer?.phone || "");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [receiptResult, setReceiptResult] = useState(null);

  const isMockMode = import.meta.env.VITE_PAYMENT_MOCK_MODE !== "false";

  useEffect(() => {
    if (initialAmount) {
      setAmount(initialAmount.toString());
    }
    if (booking?.customer?.firstName) {
      setPayerName(booking.customer.firstName);
    }
  }, [initialAmount, booking]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !processing) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, processing, onClose]);

  if (!isOpen || !invoice) return null;

  const maxPayable = invoice.balanceDue || invoice.totalAmount;

  const handlePay = async (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    const { isValid, amount: validAmount, error: valError } = validatePaymentAmount(numAmount, maxPayable);

    if (!isValid) {
      setError(valError || "Please enter a valid amount.");
      return;
    }

    setError("");
    setProcessing(true);

    try {
      // Generate client-side idempotency key for duplicate-protection
      const idempotencyKey = `IDEMP-${booking.trackingToken}-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

      // Step 1: Create Payment Intent
      const intent = await createPaymentIntent({
        bookingId: booking.publicRequestId || booking.requestId || "ST-REQ-001",
        trackingToken: booking.trackingToken,
        invoiceId: invoice.id,
        amount: validAmount,
        currency: "INR",
        paymentType,
        paymentMethod,
        idempotencyKey,
        payerName,
        payerContact
      });

      // Step 2: In Mock Mode, verify payment immediately
      const verified = await verifyPayment(intent.transactionId || intent.transaction?.transactionId);

      setReceiptResult(verified.receipt);
      onSuccess?.(verified);
    } catch (err) {
      setError(err.message || "Payment processing failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDone = () => {
    setReceiptResult(null);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 space-y-6 relative my-8"
          role="dialog"
          aria-modal="true"
        >
          {/* Close button */}
          {!processing && (
            <button
              type="button"
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Success State: Receipt */}
          {receiptResult ? (
            <div className="text-center space-y-5 py-2">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                  Payment Successfully Processed
                </span>
                <h3 className="text-2xl font-display font-semibold text-white">
                  ₹{receiptResult.amountPaid.toLocaleString("en-IN")} INR
                </h3>
                <p className="text-xs text-slate-400">
                  Official Receipt: <strong className="font-mono text-slate-300">{receiptResult.receiptNumber}</strong>
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs space-y-2 text-left">
                <div className="flex justify-between text-slate-400 border-b border-slate-800/80 pb-1.5">
                  <span>Transaction ID:</span>
                  <span className="font-mono text-slate-200">{receiptResult.transactionId}</span>
                </div>
                <div className="flex justify-between text-slate-400 border-b border-slate-800/80 pb-1.5">
                  <span>Payment Method:</span>
                  <span className="text-slate-200">{receiptResult.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-slate-400 border-b border-slate-800/80 pb-1.5">
                  <span>Gateway Ref:</span>
                  <span className="font-mono text-slate-300">{receiptResult.gatewayReference}</span>
                </div>
                <div className="flex justify-between text-slate-400 pt-0.5">
                  <span>Remaining Trip Balance:</span>
                  <span className="font-bold text-amber-400">₹{receiptResult.remainingBalance.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {isMockMode && (
                <div className="text-[11px] text-amber-400/90 bg-amber-950/40 border border-amber-800/40 p-2.5 rounded-xl">
                  Development simulation — booking ledger and invoice have been updated in mock storage.
                </div>
              )}

              <button
                type="button"
                onClick={handleDone}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm transition-all shadow-md shadow-amber-500/20 cursor-pointer"
              >
                Done & View Receipts
              </button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Secure 256-bit Encrypted Checkout</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-display font-semibold text-white tracking-tight">
                  Make Trip Payment
                </h2>
                <p className="text-xs text-slate-400">
                  Invoice <span className="font-mono text-slate-300">{invoice.invoiceNumber}</span> • Total: ₹{invoice.totalAmount.toLocaleString("en-IN")} • Balance: <strong className="text-amber-400">₹{maxPayable.toLocaleString("en-IN")}</strong>
                </p>
              </div>

              {/* Dev mode simulation disclaimer */}
              {isMockMode && (
                <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-800/40 text-amber-300 text-xs flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-semibold">Development Mock Gateway Active:</strong>
                    <span>No actual charges will be incurred. Simulates instant payment verification & receipt issuance.</span>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handlePay} className="space-y-4">
                {/* Amount input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Amount to Pay (INR) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-base">₹</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value);
                        setError("");
                      }}
                      placeholder={`Max: ${maxPayable}`}
                      max={maxPayable}
                      min={1}
                      className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-9 pr-4 py-3 text-base sm:text-lg font-bold text-white focus:outline-none focus:border-amber-500 font-mono"
                      required
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                    <span>Remaining Balance: ₹{maxPayable.toLocaleString("en-IN")}</span>
                    <button
                      type="button"
                      onClick={() => setAmount(maxPayable.toString())}
                      className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer underline"
                    >
                      Pay Full Remaining
                    </button>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Select Payment Method
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {PAYMENT_METHODS.map((pm) => {
                      const Icon = pm.icon;
                      const isSelected = paymentMethod === pm.id;
                      return (
                        <button
                          key={pm.id}
                          type="button"
                          onClick={() => setPaymentMethod(pm.id)}
                          className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                            isSelected
                              ? "bg-amber-500/15 border-amber-500 text-amber-300 font-semibold"
                              : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="w-4 h-4 text-amber-400" />
                            <span className="text-xs">{pm.label}</span>
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Payer Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Payer Name
                  </label>
                  <input
                    type="text"
                    value={payerName}
                    onChange={(e) => setPayerName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={processing || !amount || parseFloat(amount) <= 0}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm sm:text-base transition-all shadow-lg shadow-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Pay ₹{parseFloat(amount || 0).toLocaleString("en-IN")} via {paymentMethod}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
