/**
 * Operations Finance & Invoice Panel — Module 12
 * Handles invoice generation, versioning, recording manual wire transfers,
 * issuing refunds (role-gated), and reviewing the append-only financial ledger.
 */

import { useState } from "react";
import {
  FileText,
  Plus,
  CheckCircle2,
  AlertCircle,
  X
} from "lucide-react";

import { hasPermission } from "../../services/operations/operationsPermissionService";
import { getInvoices } from "../../services/financial/financialInvoiceService";
import { getTransactions, getReceipts, recordManualPayment } from "../../services/financial/financialPaymentService";
import { getLedgerEntries } from "../../services/financial/financialLedgerService";
import { processRefund, getRefunds } from "../../services/financial/financialRefundService";
import { INVOICE_STATUS_META } from "../../services/financial/financialContextService";

export default function OperationsFinancePanel({ booking, currentUser, onMutation }) {
  const [activeSection, setActiveSection] = useState("invoices"); // invoices | manual | refunds | ledger
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedTxnForRefund, setSelectedTxnForRefund] = useState(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");

  // Manual payment form state
  const [manualAmount, setManualAmount] = useState("");
  const [manualMethod, setManualMethod] = useState("BANK_TRANSFER");
  const [manualRef, setManualRef] = useState("");
  const [manualNotes, setManualNotes] = useState("");
  const [manualSubmitting, setManualSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const role = currentUser?.role || "OPERATIONS_MANAGER";
  const canCreateInv = hasPermission(role, "canCreateInvoice");
  const canManualPay = hasPermission(role, "canRecordManualPayment");
  const canRefund = hasPermission(role, "canIssueRefund");

  const bookingId = booking?.requestId || booking?.id || "ST-REQ-001";
  const trackingToken = booking?.trackingToken || "ST-TRK-DEMO";

  const invoices = getInvoices(bookingId);
  const transactions = getTransactions(bookingId);
  const receipts = getReceipts(bookingId);
  const refunds = getRefunds(bookingId);
  const ledger = getLedgerEntries(bookingId);

  // Financial health calculations
  const totalInvoiced = invoices.reduce((sum, inv) => inv.paymentStatus !== "CANCELLED" ? sum + inv.totalAmount : sum, 0);
  const totalPaid = invoices.reduce((sum, inv) => inv.paymentStatus !== "CANCELLED" ? sum + inv.amountPaid : sum, 0);
  const balanceDue = Math.max(0, totalInvoiced - totalPaid);

  const activeInvoice = invoices.find(i => i.paymentStatus !== "CANCELLED") || invoices[0];

  // Handle Manual Payment Submission
  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!activeInvoice) {
      setFeedback({ type: "error", message: "No active invoice found to record payment against." });
      return;
    }
    const num = parseFloat(manualAmount);
    if (isNaN(num) || num <= 0) {
      setFeedback({ type: "error", message: "Please enter a valid payment amount." });
      return;
    }
    if (num > activeInvoice.balanceDue) {
      setFeedback({ type: "error", message: `Amount exceeds remaining balance due (₹${activeInvoice.balanceDue.toLocaleString("en-IN")}).` });
      return;
    }

    setManualSubmitting(true);
    setFeedback(null);
    try {
      await recordManualPayment(bookingId, {
        invoiceId: activeInvoice.id,
        amount: num,
        paymentMethod: manualMethod,
        referenceNumber: manualRef,
        notes: manualNotes,
        actorId: currentUser?.name || "Operations Desk",
        actorRole: role
      });

      setManualAmount("");
      setManualRef("");
      setManualNotes("");
      setFeedback({ type: "success", message: `Manual payment of ₹${num.toLocaleString("en-IN")} recorded successfully.` });
      onMutation?.();
    } catch (err) {
      setFeedback({ type: "error", message: err.message || "Failed to record manual payment." });
    } finally {
      setManualSubmitting(false);
    }
  };

  // Handle Refund Process
  const handleProcessRefund = async (e) => {
    e.preventDefault();
    if (!selectedTxnForRefund) return;
    const num = parseFloat(refundAmount);
    if (isNaN(num) || num <= 0 || num > selectedTxnForRefund.amount) {
      setFeedback({ type: "error", message: `Please enter a valid refund amount up to ₹${selectedTxnForRefund.amount.toLocaleString("en-IN")}.` });
      return;
    }

    try {
      await processRefund({
        bookingId,
        transactionId: selectedTxnForRefund.transactionId,
        amount: num,
        reason: refundReason,
        actorId: currentUser?.name || "Operations Desk",
        actorRole: role
      });

      setShowRefundModal(false);
      setSelectedTxnForRefund(null);
      setRefundAmount("");
      setRefundReason("");
      setFeedback({ type: "success", message: `Refund of ₹${num.toLocaleString("en-IN")} authorized and processed.` });
      onMutation?.();
    } catch (err) {
      setFeedback({ type: "error", message: err.message || "Failed to process refund." });
    }
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Financial Health Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="text-[11px] text-slate-500 uppercase font-semibold">Total Invoiced</div>
          <div className="text-xl font-bold text-white">
            ₹{totalInvoiced.toLocaleString("en-IN")}
          </div>
          <div className="text-[10px] text-slate-400">
            {invoices.filter(i => i.paymentStatus !== "CANCELLED").length} active invoice(s)
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="text-[11px] text-emerald-400 uppercase font-semibold">Total Collected</div>
          <div className="text-xl font-bold text-emerald-400">
            ₹{totalPaid.toLocaleString("en-IN")}
          </div>
          <div className="text-[10px] text-slate-400">
            {receipts.length} verified receipt(s)
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="text-[11px] text-amber-400 uppercase font-semibold">Outstanding Balance</div>
          <div className="text-xl font-bold text-amber-400">
            ₹{balanceDue.toLocaleString("en-IN")}
          </div>
          <div className="text-[10px] text-slate-400">
            {balanceDue === 0 ? "Fully settled" : "Due before travel"}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="text-[11px] text-slate-500 uppercase font-semibold">Payment Status</div>
          <div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
              balanceDue === 0 && totalInvoiced > 0
                ? "bg-emerald-950/80 border-emerald-800 text-emerald-300"
                : totalPaid > 0
                ? "bg-blue-950/80 border-blue-800 text-blue-300"
                : "bg-amber-950/80 border-amber-800 text-amber-300"
            }`}>
              {balanceDue === 0 && totalInvoiced > 0 ? "PAID IN FULL" : totalPaid > 0 ? "PARTIALLY PAID" : "PAYMENT PENDING"}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 pt-1">
            Tracking: {trackingToken}
          </div>
        </div>
      </div>

      {/* Feedback message */}
      {feedback && (
        <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
          feedback.type === "success"
            ? "bg-emerald-950/50 border-emerald-800 text-emerald-200"
            : "bg-rose-950/50 border-rose-800 text-rose-200"
        }`}>
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
            <span>{feedback.message}</span>
          </div>
          <button type="button" onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Sub-Section Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveSection("invoices")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeSection === "invoices"
              ? "bg-indigo-600 text-white"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          Invoices ({invoices.length})
        </button>

        {canManualPay && (
          <button
            type="button"
            onClick={() => setActiveSection("manual")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeSection === "manual"
                ? "bg-indigo-600 text-white"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            Record Wire / Cash
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveSection("ledger")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeSection === "ledger"
              ? "bg-indigo-600 text-white"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          Financial Ledger ({ledger.length})
        </button>

        {canRefund && (
          <button
            type="button"
            onClick={() => setActiveSection("refunds")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeSection === "refunds"
                ? "bg-indigo-600 text-white"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            Refunds ({refunds.length})
          </button>
        )}
      </div>

      {/* SECTION 1: INVOICES */}
      {activeSection === "invoices" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Issued Invoices</h3>
            {canCreateInv && (
              <button
                type="button"
                onClick={() => setShowGenerateModal(true)}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Issue New Version</span>
              </button>
            )}
          </div>

          {invoices.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/50 border border-slate-800 rounded-2xl text-slate-500 text-xs space-y-2">
              <FileText className="w-8 h-8 mx-auto text-slate-600" />
              <p>No invoices generated yet for this booking.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {invoices.map((inv) => {
                const statusMeta = INVOICE_STATUS_META[inv.paymentStatus] || { label: inv.paymentStatus, badgeClass: "bg-slate-800 text-slate-300" };

                return (
                  <div
                    key={inv.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-indigo-400">{inv.invoiceNumber}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                            {inv.versionLabel}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${statusMeta.badgeClass}`}>
                            {statusMeta.label}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          Issued by {inv.issuedBy} on {new Date(inv.issuedAt).toLocaleDateString()} • Due by {new Date(inv.dueDate).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-bold text-white">
                          ₹{inv.totalAmount.toLocaleString("en-IN")}{" "}
                          <span className="text-xs text-slate-400 font-normal">{inv.currency}</span>
                        </div>
                        <div className="text-xs text-slate-400">
                          Paid: ₹{inv.amountPaid.toLocaleString("en-IN")} • Balance Due: <strong className="text-amber-400">₹{inv.balanceDue.toLocaleString("en-IN")}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Line Items */}
                    <div className="space-y-1.5 text-xs">
                      {inv.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-slate-300 py-1 border-b border-slate-800/40">
                          <span>{item.description} ({item.quantity}x)</span>
                          <span className="font-mono font-medium">₹{item.total.toLocaleString("en-IN")}</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-slate-400 pt-1 text-[11px]">
                        <span>GST (5% Tour Package Rate)</span>
                        <span className="font-mono">₹{inv.taxAmount.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: RECORD MANUAL PAYMENT */}
      {activeSection === "manual" && canManualPay && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Record Offline Bank Wire / Cash Payment</h3>
            <p className="text-xs text-slate-400">
              Directly credit a customer's balance upon verifying an NEFT/RTGS wire transfer or physical payment.
            </p>
          </div>

          <form onSubmit={handleRecordPayment} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Payment Amount (INR) *
                </label>
                <input
                  type="number"
                  value={manualAmount}
                  onChange={(e) => setManualAmount(e.target.value)}
                  placeholder={`Max: ₹${activeInvoice?.balanceDue || 0}`}
                  max={activeInvoice?.balanceDue || 1000000}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Payment Method *
                </label>
                <select
                  value={manualMethod}
                  onChange={(e) => setManualMethod(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="BANK_TRANSFER">Bank Transfer (NEFT / RTGS / IMPS)</option>
                  <option value="UPI">Direct UPI Transfer</option>
                  <option value="CASH">Cash Deposit</option>
                  <option value="CREDIT_CARD">POS Terminal Card</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Bank UTR / Transaction Reference Number *
              </label>
              <input
                type="text"
                value={manualRef}
                onChange={(e) => setManualRef(e.target.value)}
                placeholder="e.g. UTR-HDFC-991823741"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Verification Notes
              </label>
              <input
                type="text"
                value={manualNotes}
                onChange={(e) => setManualNotes(e.target.value)}
                placeholder="e.g. Verified with HDFC current account statement"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={manualSubmitting || !manualAmount}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all disabled:opacity-40 cursor-pointer"
            >
              {manualSubmitting ? "Recording Transaction..." : "Record & Issue Official Receipt"}
            </button>
          </form>
        </div>
      )}

      {/* SECTION 3: LEDGER */}
      {activeSection === "ledger" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Append-Only Financial Ledger History</h3>
            <span className="text-[10px] text-slate-400 font-mono">Immutable audit log</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Description</th>
                  <th className="p-3.5 text-right">Debit / Credit</th>
                  <th className="p-3.5 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {ledger.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-800/40">
                    <td className="p-3.5 text-slate-400 font-mono text-[11px]">
                      {new Date(entry.timestamp).toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" })}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        entry.debitCredit === "CREDIT" ? "bg-emerald-950 text-emerald-400" : "bg-amber-950 text-amber-400"
                      }`}>
                        {entry.entryType}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-200">
                      <div>{entry.description}</div>
                      <div className="text-[10px] text-slate-500">By: {entry.actorId} ({entry.actorRole})</div>
                    </td>
                    <td className={`p-3.5 text-right font-mono font-semibold ${
                      entry.debitCredit === "CREDIT" ? "text-emerald-400" : "text-slate-200"
                    }`}>
                      {entry.debitCredit === "CREDIT" ? "+" : "-"}₹{entry.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="p-3.5 text-right font-mono text-slate-300 font-semibold">
                      ₹{entry.runningBalance.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 4: REFUNDS */}
      {activeSection === "refunds" && canRefund && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Refund Authorizations</h3>
            <span className="text-[10px] text-purple-400 font-semibold bg-purple-950 px-2.5 py-1 rounded-full border border-purple-800">
              Role: Operations Manager / Admin
            </span>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Eligible Transactions</h4>
            {transactions.filter(t => t.status === "PAYMENT_RECEIVED").map((txn) => (
              <div
                key={txn.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-mono font-semibold text-white">{txn.transactionId}</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    ₹{txn.amount.toLocaleString("en-IN")} via {txn.paymentMethod} on {new Date(txn.completedAt).toLocaleDateString()}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedTxnForRefund(txn);
                    setRefundAmount(txn.amount.toString());
                    setShowRefundModal(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  Authorize Refund
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && selectedTxnForRefund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">Authorize Customer Refund</h3>
              <button onClick={() => setShowRefundModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleProcessRefund} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Refund Amount (INR) *</label>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  max={selectedTxnForRefund.amount}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Reason for Refund *</label>
                <input
                  type="text"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="e.g. Route shortened due to weather advisory"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRefundModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold cursor-pointer"
                >
                  Authorize Refund
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
