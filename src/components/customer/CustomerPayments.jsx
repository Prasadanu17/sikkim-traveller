import { useState } from "react";
import {
  Receipt,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Eye,
  Lock,
  ChevronRight,
  X
} from "lucide-react";

import { getInvoices } from "../../services/financial/financialInvoiceService";
import { getReceipts } from "../../services/financial/financialPaymentService";
import { INVOICE_STATUS_META } from "../../services/financial/financialContextService";
import CustomerPaymentModal from "./CustomerPaymentModal";

export default function CustomerPayments({ booking, onBookingUpdated }) {
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [payAmountPreset, setPayAmountPreset] = useState(0);
  const [payTypePreset, setPayTypePreset] = useState("ADVANCE");
  const [previewInvoice, setPreviewInvoice] = useState(null);
  const [previewReceipt, setPreviewReceipt] = useState(null);

  const bookingId = booking?.publicRequestId || booking?.requestId || booking?.id || "ST-REQ-001";
  const trackingToken = booking?.trackingToken || "ST-TRK-DEMO";

  const invoices = getInvoices(bookingId).concat(getInvoices(trackingToken)).filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
  const receipts = getReceipts(bookingId).concat(getReceipts(trackingToken)).filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);

  const activeInvoice = invoices.find(i => i.paymentStatus !== "CANCELLED") || invoices[0];

  const totalInvoiced = activeInvoice ? activeInvoice.totalAmount : (booking?.proposal?.price || booking?.budget?.estimated || 41500);
  const totalPaid = activeInvoice ? activeInvoice.amountPaid : 0;
  const balanceDue = activeInvoice ? activeInvoice.balanceDue : totalInvoiced;
  const advanceRequired = activeInvoice ? activeInvoice.advanceRequired : Math.round(totalInvoiced * 0.30);

  const handleOpenPay = (amt, type) => {
    setPayAmountPreset(amt);
    setPayTypePreset(type);
    setPaymentModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    onBookingUpdated?.({
      ...booking,
      updatedAt: new Date().toISOString()
    });
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-xl space-y-8 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Payments & Financial Operations</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400">Encrypted Gateway</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-semibold text-white mt-1">
            Trip Billing & Payment History
          </h2>
        </div>

        <span className="text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1.5 rounded-full font-semibold self-start sm:self-auto flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5" />
          <span>SSL 256-Bit Protected</span>
        </span>
      </div>

      {/* Main Billing Summary Card */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-950/90 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <span className="text-[11px] text-slate-500 uppercase font-semibold block mb-1">Total Trip Investment</span>
            <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              ₹{totalInvoiced.toLocaleString("en-IN")}{" "}
              <span className="text-xs text-slate-400 font-normal">INR</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">5% Tour GST included</span>
          </div>

          <div>
            <span className="text-[11px] text-emerald-400 uppercase font-semibold block mb-1">Amount Paid to Date</span>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-400 tracking-tight">
              ₹{totalPaid.toLocaleString("en-IN")}{" "}
              <span className="text-xs text-slate-400 font-normal">INR</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">{receipts.length} verified receipt(s)</span>
          </div>

          <div>
            <span className="text-[11px] text-amber-400 uppercase font-semibold block mb-1">Remaining Balance Due</span>
            <div className="text-2xl sm:text-3xl font-bold text-amber-400 tracking-tight">
              ₹{balanceDue.toLocaleString("en-IN")}{" "}
              <span className="text-xs text-slate-400 font-normal">INR</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {activeInvoice?.dueDate ? `Due by ${new Date(activeInvoice.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}` : "Due before travel"}
            </span>
          </div>
        </div>

        {/* Action Payment Buttons (if balance remains) */}
        {balanceDue > 0 && activeInvoice && (
          <div className="pt-6 border-t border-slate-800/80 space-y-3">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Available Payment Options
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option 1: Pay Advance Deposit */}
              {totalPaid < advanceRequired && (
                <button
                  type="button"
                  onClick={() => handleOpenPay(advanceRequired - totalPaid, "ADVANCE")}
                  className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm text-left transition-all shadow-lg shadow-amber-500/20 flex flex-col justify-between gap-2 group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span>Pay 30% Advance Deposit</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div className="text-base font-extrabold font-mono">
                    ₹{(advanceRequired - totalPaid).toLocaleString("en-IN")} INR
                  </div>
                  <div className="text-[10px] text-slate-900/80 font-medium">
                    Locks room allotments and dedicated 4WD vehicle
                  </div>
                </button>
              )}

              {/* Option 2: Pay Full Remaining */}
              <button
                type="button"
                onClick={() => handleOpenPay(balanceDue, "FINAL_BALANCE")}
                className="p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs sm:text-sm text-left transition-all flex flex-col justify-between gap-2 group cursor-pointer"
              >
                <div className="flex items-center justify-between text-slate-300">
                  <span>Pay Full Remaining Balance</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-amber-400" />
                </div>
                <div className="text-base font-extrabold text-amber-400 font-mono">
                  ₹{balanceDue.toLocaleString("en-IN")} INR
                </div>
                <div className="text-[10px] text-slate-400 font-normal">
                  Zero balance settlement for instant confirmation
                </div>
              </button>

              {/* Option 3: Custom Partial Amount */}
              <button
                type="button"
                onClick={() => handleOpenPay(Math.round(balanceDue / 2), "PARTIAL")}
                className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-xs sm:text-sm text-left transition-all flex flex-col justify-between gap-2 group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span>Pay Custom Amount</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="text-xs text-slate-400 font-normal">
                  Enter any partial installment amount
                </div>
                <div className="text-[10px] text-slate-500">
                  Flexible installments supported
                </div>
              </button>
            </div>
          </div>
        )}

        {balanceDue === 0 && totalInvoiced > 0 && (
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <strong className="block text-emerald-200 font-semibold">Trip Fully Paid:</strong>
              <span>All package charges and government cess have been settled. Your travel confirmation vouchers are fully valid.</span>
            </div>
          </div>
        )}
      </div>

      {/* Invoices List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>Official Tax Invoices ({invoices.length})</span>
          </h3>
        </div>

        {invoices.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center text-slate-500 text-xs">
            Invoices will appear here once published by our destination architect.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {invoices.map((inv) => {
              const statusMeta = INVOICE_STATUS_META[inv.paymentStatus] || { label: inv.paymentStatus, badgeClass: "bg-slate-800 text-slate-300" };

              return (
                <div
                  key={inv.id}
                  className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 space-y-4 flex flex-col justify-between transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono text-xs font-bold text-indigo-400">{inv.invoiceNumber}</span>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">{inv.versionLabel}</div>
                      </div>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border ${statusMeta.badgeClass}`}>
                        {statusMeta.label}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 font-medium">
                      Total: ₹{inv.totalAmount.toLocaleString("en-IN")} INR • Balance Due: <strong className="text-amber-400">₹{inv.balanceDue.toLocaleString("en-IN")}</strong>
                    </div>

                    <div className="text-[11px] text-slate-500">
                      Due by: {new Date(inv.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewInvoice(inv)}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Tax Breakdown</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Official Receipts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-400" />
            <span>Verified Payment Receipts ({receipts.length})</span>
          </h3>
        </div>

        {receipts.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center text-slate-500 text-xs">
            Payment receipts are issued immediately upon successful advance or balance payments.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {receipts.map((rec) => (
              <div
                key={rec.id}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-emerald-400">{rec.receiptNumber}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-semibold">
                      VERIFIED
                    </span>
                  </div>

                  <div className="text-lg font-bold text-white font-mono">
                    ₹{rec.amountPaid.toLocaleString("en-IN")} <span className="text-xs text-slate-400 font-normal">INR</span>
                  </div>

                  <div className="text-xs text-slate-400">
                    Paid via {rec.paymentMethod} on {new Date(rec.paidAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewReceipt(rec)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Receipt</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Payment Modal */}
      {activeInvoice && (
        <CustomerPaymentModal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          booking={booking}
          invoice={activeInvoice}
          initialAmount={payAmountPreset}
          paymentType={payTypePreset}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Modal: Invoice Preview */}
      {previewInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 text-slate-100 shadow-2xl relative my-8">
            <button
              onClick={() => setPreviewInvoice(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                Official Tax Invoice • {previewInvoice.versionLabel}
              </span>
              <h3 className="text-2xl font-display font-semibold text-white">
                {previewInvoice.invoiceNumber}
              </h3>
              <p className="text-xs text-slate-400">
                Issued to: <strong className="text-slate-200">{previewInvoice.recipient?.name}</strong> • Due: {new Date(previewInvoice.dueDate).toLocaleDateString()}
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
              <div className="font-semibold text-slate-300 pb-1 border-b border-slate-800">
                Itemized Package Summary
              </div>
              {previewInvoice.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-slate-400 py-1">
                  <span>{item.description} (x{item.quantity})</span>
                  <span className="font-mono text-slate-200">₹{item.total.toLocaleString("en-IN")}</span>
                </div>
              ))}
              <div className="flex justify-between text-slate-400 pt-2 border-t border-slate-800">
                <span>Subtotal</span>
                <span className="font-mono">₹{previewInvoice.subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>CGST (2.5%)</span>
                <span className="font-mono">₹{previewInvoice.cgstAmount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>SGST (2.5%)</span>
                <span className="font-mono">₹{previewInvoice.sgstAmount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-slate-800">
                <span>Total Package Price</span>
                <span className="font-mono">₹{previewInvoice.totalAmount.toLocaleString("en-IN")} INR</span>
              </div>
            </div>

            <div className="flex justify-between text-xs text-slate-500">
              <span>Status: <strong className="text-amber-400">{previewInvoice.paymentStatus}</strong></span>
              <span>Balance: <strong className="text-white">₹{previewInvoice.balanceDue.toLocaleString("en-IN")}</strong></span>
            </div>

            <button
              onClick={() => setPreviewInvoice(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-200 font-semibold text-xs cursor-pointer"
            >
              Close Invoice
            </button>
          </div>
        </div>
      )}

      {/* Modal: Receipt Preview */}
      {previewReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 text-slate-100 shadow-2xl relative">
            <button
              onClick={() => setPreviewReceipt(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <Receipt className="w-6 h-6" />
              </div>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block mt-2">
                Official Payment Receipt
              </span>
              <h3 className="text-xl font-display font-semibold text-white">
                {previewReceipt.receiptNumber}
              </h3>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs space-y-2">
              <div className="flex justify-between text-slate-400 border-b border-slate-800 pb-1">
                <span>Amount Paid:</span>
                <span className="font-bold text-emerald-400 font-mono">₹{previewReceipt.amountPaid.toLocaleString("en-IN")} INR</span>
              </div>
              <div className="flex justify-between text-slate-400 border-b border-slate-800 pb-1">
                <span>Payment Mode:</span>
                <span className="text-slate-200">{previewReceipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-slate-400 border-b border-slate-800 pb-1">
                <span>Date & Time:</span>
                <span className="text-slate-200">{new Date(previewReceipt.paidAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400 border-b border-slate-800 pb-1">
                <span>Gateway Ref:</span>
                <span className="font-mono text-slate-300">{previewReceipt.gatewayReference}</span>
              </div>
              <div className="flex justify-between text-slate-400 pt-1">
                <span>Remaining Balance:</span>
                <span className="font-bold text-amber-400">₹{previewReceipt.remainingBalance.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="text-[10px] text-center text-slate-500">
              Verified by Sikkim Traveller Operations Accounts Desk
            </div>

            <button
              onClick={() => setPreviewReceipt(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-200 font-semibold text-xs cursor-pointer"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
