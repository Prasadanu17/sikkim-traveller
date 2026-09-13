/**
 * Customer Portal Tool Executor — Module 11
 * Executes scoped, customer-safe read-only tools for the AI assistant.
 * Explicitly guards against write operations, unauthorized access, or internal data leakage.
 */

import { CUSTOMER_TOOLS } from "./customerPortalToolRegistry";

/**
 * Executes a customer assistant query against the active booking context.
 * @param {string} toolName
 * @param {object} booking - Active customer-safe booking model
 * @param {object} params
 */
export async function executeCustomerTool(toolName, booking, _params = {}) {
  if (!booking) {
    return {
      success: false,
      error: "No active booking context found. Please load a valid tracking token."
    };
  }

  // Guard: Check tool existence and read-only enforcement
  const toolDef = CUSTOMER_TOOLS[toolName];
  if (!toolDef || !toolDef.isReadOnly) {
    return {
      success: false,
      error: "This action is restricted. As a customer travel concierge assistant, I can provide information and answer questions about your trip, but modifications must be requested through the 'Request Changes' feature or with the Operations team."
    };
  }

  switch (toolName) {
    case "getBookingStatus": {
      return {
        success: true,
        tool: toolName,
        data: {
          trackingToken: booking.trackingToken,
          publicRequestId: booking.publicRequestId,
          status: booking.status,
          statusLabel: booking.friendlyStatus?.label,
          description: booking.friendlyStatus?.description,
          countdown: booking.countdownText,
          updatedAt: booking.updatedAt
        },
        formattedResponse: `**Current Booking Status: ${booking.friendlyStatus?.label || booking.status}**\n\n${booking.friendlyStatus?.description || ""}\n\n- **Tracking Token**: \`${booking.trackingToken}\`\n- **Request ID**: \`${booking.publicRequestId}\`\n- **Departure**: ${booking.countdownText}\n- **Next Action**: ${booking.nextAction}`
      };
    }

    case "getTripItinerary": {
      const days = booking.itinerary?.days || [];
      const daysSummary = days.map(d => `• **Day ${d.dayNumber}: ${d.title}** (${d.baseLocation} • ${d.elevation || ""})\n  ${(d.highlights || []).join(", ")}`).join("\n\n");

      return {
        success: true,
        tool: toolName,
        data: {
          title: booking.itinerary?.title,
          version: booking.itinerary?.version,
          totalDays: days.length,
          days
        },
        formattedResponse: `### ${booking.itinerary?.title || "Your Custom Sikkim Itinerary"}\n\n**Total Duration**: ${booking.trip?.duration} Days / ${Math.max(1, (booking.trip?.duration || 1) - 1)} Nights\n**Destinations**: ${(booking.trip?.destinations || []).join(", ")}\n\n${daysSummary}`
      };
    }

    case "getLatestProposal": {
      const prop = booking.proposal;
      if (!prop) {
        return {
          success: true,
          tool: toolName,
          data: null,
          formattedResponse: "Our destination specialists are currently working on your custom proposal. You will receive an alert as soon as the quote and itinerary are published."
        };
      }

      return {
        success: true,
        tool: toolName,
        data: prop,
        formattedResponse: `### ${prop.versionLabel || "Proposal"}\n\n- **Total Investment**: ₹${(prop.price || 0).toLocaleString("en-IN")} ${prop.currency}\n- **Valid Until**: ${prop.validUntil ? new Date(prop.validUntil).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "Flexible"}\n- **Summary**: ${prop.summary || "Custom tailored Himalayan arrangements"}\n- **Status**: ${booking.customerApproval?.accepted ? "✅ Approved by you" : "⏳ Ready for review"}`
      };
    }

    case "getInclusionsAndExclusions": {
      const prop = booking.proposal;
      if (!prop) {
        return {
          success: true,
          tool: toolName,
          data: null,
          formattedResponse: "Inclusions will be detailed in your upcoming proposal."
        };
      }

      const incList = (prop.inclusions || []).map(i => `✅ ${i}`).join("\n");
      const excList = (prop.exclusions || []).map(e => `❌ ${e}`).join("\n");

      return {
        success: true,
        tool: toolName,
        data: { inclusions: prop.inclusions, exclusions: prop.exclusions },
        formattedResponse: `### Inclusions & Exclusions for ${prop.versionLabel || "Your Proposal"}\n\n**What's Included:**\n${incList || "Details included in proposal."}\n\n**What's Excluded:**\n${excList || "Personal expenses, flights to/from Bagdogra/NJP."}`
      };
    }

    case "getRealtimeTravelAlerts": {
      const issues = booking.permits?.customerRelevantIssues || [];
      const issuesText = issues.length > 0
        ? issues.map(i => `⚠️ ${i}`).join("\n")
        : "✅ No critical travel advisories currently active for your selected route.";

      return {
        success: true,
        tool: toolName,
        data: { issues },
        formattedResponse: `### Sikkim Travel Intelligence & Advisory Status\n\n${issuesText}\n\n*Our 24/7 Operations Desk monitors high-altitude weather and road conditions continuously.*`
      };
    }

    case "getDocumentsList": {
      const docs = booking.documents || [];
      if (docs.length === 0) {
        return {
          success: true,
          tool: toolName,
          data: [],
          formattedResponse: "Official travel vouchers and permit documents will appear in your Documents tab once your booking is confirmed by our operations team."
        };
      }

      const docsList = docs.map(d => `📄 **${d.name}** (${d.type}) — Status: *${d.status}* [${d.version || "v1"}]`).join("\n");

      return {
        success: true,
        tool: toolName,
        data: docs,
        formattedResponse: `### Available Travel Documents (${docs.length})\n\n${docsList}\n\nYou can preview or download these anytime from the **Documents** tab.`
      };
    }

    case "getNextSteps": {
      return {
        success: true,
        tool: toolName,
        data: { nextAction: booking.nextAction, status: booking.status },
        formattedResponse: `### What's Next for Your Trip\n\n${booking.nextAction}\n\nIf you have any questions or want to request changes to dates or hotels, feel free to use the **Request Changes** button or chat directly with our team in the **Messages** tab.`
      };
    }

    case "getPostApprovalProcess": {
      return {
        success: true,
        tool: toolName,
        data: {},
        formattedResponse: `### What Happens After You Approve a Proposal?\n\n1. **Operations Verification**: Our desk locks in your specific room allotments, vehicle assignment, and private driver.\n2. **Permit Filing**: For protected areas like Yumthang Valley, Lachung, and Nathula Pass, our team initiates government permit paperwork.\n3. **Final Confirmation & Vouchers**: You will receive official hotel booking vouchers, vehicle driver contacts, and emergency helpline numbers in your **Documents** tab.\n4. **On-Trip Support**: Our 24/7 operations concierge remains available via WhatsApp/phone throughout your stay.`
      };
    }

    case "getPaymentAndBillingStatus": {
      const price = booking.proposal?.price || booking.budget?.estimated || 41500;
      const advanceRequired = Math.round(price * 0.30);

      return {
        success: true,
        tool: toolName,
        data: { total: price, advance: advanceRequired },
        formattedResponse: `### Trip Billing & Payment Overview\n\n- **Total Investment**: ₹${price.toLocaleString("en-IN")} INR (All-Inclusive)\n- **Advance Deposit Required (30%)**: ₹${advanceRequired.toLocaleString("en-IN")} INR\n- **Payment Method Options**: UPI (GPay/PhonePe/Paytm), Credit/Debit Card, Net Banking\n- **Security**: 256-Bit SSL Encrypted\n\n*You can review official tax invoices and make payments securely in the **Payments & Billing** tab.*`
      };
    }

    case "getPaymentReceipts": {
      return {
        success: true,
        tool: toolName,
        data: {},
        formattedResponse: `### Verified Payment Receipts\n\nOfficial tax receipts with unique transaction IDs and GST breakdowns are issued immediately upon every successful advance or balance payment. You can view or download receipts anytime from the **Payments & Billing** tab.`
      };
    }

    default:
      return {
        success: false,
        error: `Unknown tool "${toolName}".`
      };
  }
}

/**
 * Interprets a natural language question and maps it to the appropriate customer read tool.
 * @param {string} prompt
 * @param {object} booking
 */
export async function answerCustomerQuery(prompt, booking) {
  if (!prompt || typeof prompt !== "string") {
    return "Please enter a question about your trip.";
  }

  const p = prompt.toLowerCase().trim();

  // Guard: Prohibit write/financial mutations
  if (
    p.includes("mark paid") ||
    p.includes("confirm payment") ||
    p.includes("issue refund") ||
    p.includes("refund me") ||
    p.includes("change price") ||
    p.includes("discount") ||
    p.includes("cancel invoice")
  ) {
    return "⚠️ **Security Notice**: As a read-only travel concierge assistant, I cannot directly confirm payments, modify invoice amounts, issue refunds, or mark balances as paid. To make a payment, please use the secure **Payments & Billing** tab. For refunds or price inquiries, please contact our Operations Desk.";
  }

  // Route queries to appropriate tools
  if (p.includes("payment") || p.includes("billing") || p.includes("invoice") || p.includes("advance") || p.includes("deposit") || p.includes("balance")) {
    const res = await executeCustomerTool("getPaymentAndBillingStatus", booking);
    return res.formattedResponse;
  }

  if (p.includes("receipt") || p.includes("proof of payment") || p.includes("tax invoice")) {
    const res = await executeCustomerTool("getPaymentReceipts", booking);
    return res.formattedResponse;
  }

  if (p.includes("status") || p.includes("where is my booking") || p.includes("track")) {
    const res = await executeCustomerTool("getBookingStatus", booking);
    return res.formattedResponse;
  }

  if (p.includes("itinerary") || p.includes("days") || p.includes("schedule") || p.includes("places we visit") || p.includes("plan")) {
    const res = await executeCustomerTool("getTripItinerary", booking);
    return res.formattedResponse;
  }

  if (p.includes("include") || p.includes("exclude") || p.includes("inclusions") || p.includes("exclusions") || p.includes("what is covered")) {
    const res = await executeCustomerTool("getInclusionsAndExclusions", booking);
    return res.formattedResponse;
  }

  if (p.includes("price") || p.includes("cost") || p.includes("proposal") || p.includes("quote") || p.includes("budget")) {
    const res = await executeCustomerTool("getLatestProposal", booking);
    return res.formattedResponse;
  }

  if (p.includes("alert") || p.includes("weather") || p.includes("road") || p.includes("landslide") || p.includes("permit")) {
    const res = await executeCustomerTool("getRealtimeTravelAlerts", booking);
    return res.formattedResponse;
  }

  if (p.includes("document") || p.includes("voucher") || p.includes("download")) {
    const res = await executeCustomerTool("getDocumentsList", booking);
    return res.formattedResponse;
  }

  if (p.includes("what happens after") || p.includes("after approval") || p.includes("after i approve")) {
    const res = await executeCustomerTool("getPostApprovalProcess", booking);
    return res.formattedResponse;
  }

  if (p.includes("next") || p.includes("what should i do") || p.includes("action") || p.includes("step")) {
    const res = await executeCustomerTool("getNextSteps", booking);
    return res.formattedResponse;
  }

  // Default fallback for general questions
  return `I am your **Sikkim Traveller Concierge**. I can help you with:\n\n- Checking your **trip & booking status**\n- Reviewing your **invoices, advance deposit, & payment balance**\n- Explaining your **itinerary** and daily plans\n- Reviewing what is **included / excluded** in your proposal\n- Providing **live weather and travel alerts**\n- Accessing your **travel documents and vouchers**\n\n*Feel free to click any of the suggested question chips below or ask me directly!*`;
}
