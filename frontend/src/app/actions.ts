"use server";

import { prisma } from "@/lib/prisma";

export async function getCustomersAction() {
  const data = await prisma.customer.findMany({
    take: 50,
    orderBy: { created_at: "desc" },
    include: {
      predictions: {
        take: 1,
        orderBy: { predicted_at: "desc" }
      },
      features: true
    }
  });

  return data.map(c => ({
    internalId: c.id,
    id: c.customer_ref,
    limit: c.limit_bal,
    age: c.age,
    stress: c.predictions[0]?.stress_label || "Unknown",
    esc: c.predictions[0]?.escalation_flag === 1 ? "Escalating" : "Stable",
    action: c.predictions[0]?.recommended_action || "None",
    date: c.created_at.toLocaleDateString(),
    util: c.features?.avg_utilization || 0,
    delay: c.features?.avg_pay_delay || 0,
    narrative: c.predictions[0]?.gemini_narrative || "No narrative generated yet.",
    prob: c.predictions[0]?.escalation_prob || 0
  }));
}

import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";

export async function registerUserAction(formData: any) {
  const { name, email, password } = formData;
  if (!name || !email || !password) throw new Error("Missing fields");

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw new Error("User already exists");

  const hashed_password = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, hashed_password, role: "analyst" }
  });
  return { success: true, userId: user.id };
}

import { SignJWT } from "jose";

export async function runPredictionAction(internalCustomerId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
  const token = await new SignJWT({
    sub: session.user.id,
    type: "access"
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .sign(secret);

  const res = await fetch(`${process.env.FASTAPI_URL || 'http://localhost:8000'}/api/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ customer_id: internalCustomerId })
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Prediction engine responded with error: ${errorText}`);
  }

  return await res.json();
}

export async function registerBulkCustomersAction(customersData: any[]) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  const userId = session.user.id;

  let count = 0;
  for (const row of customersData) {
    // Generate a robust customer_ref if one wasn't provided securely
    const customer_ref = row["Customer Ref"] || row["customer_ref"] || `CUST-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Note: Upsert to avoid uniqueness constraints breaking the whole loop
    const cust = await prisma.customer.upsert({
      where: { customer_ref },
      update: {},
      create: {
        customer_ref,
        limit_bal: Number(row["Limit Balance"] || row["limit_bal"] || 50000),
        sex: Number(row["Sex"] || row["sex"] || 1),
        education: Number(row["Education"] || row["education"] || 1),
        marriage: Number(row["Marriage"] || row["marriage"] || 1),
        age: Number(row["Age"] || row["age"] || 30),
        created_by: userId,
      }
    });

    await prisma.customerFeature.upsert({
      where: { customer_id: cust.id },
      update: {},
      create: {
        customer_id: cust.id,
        avg_utilization: Number(row["Avg Utilization"] || row["avg_utilization"] || 0.5),
        util_change: Number(row["Util Change"] || row["util_change"] || 0.0),
        pay_delay_trend: Number(row["Pay Delay Trend"] || row["pay_delay_trend"] || 0.0),
        avg_pay_delay: Number(row["Avg Pay Delay"] || row["avg_pay_delay"] || 0.0),
        consecutive_delays: Number(row["Consecutive Delays"] || row["consecutive_delays"] || 0),
        avg_repay_ratio: Number(row["Avg Repay Ratio"] || row["avg_repay_ratio"] || 1.0),
        spending_volatility: Number(row["Spending Volatility"] || row["spending_volatility"] || 0.5),
        pay_amt_trend: Number(row["Pay Amt Trend"] || row["pay_amt_trend"] || 0.0),
      }
    });
    count++;
  }
  return { success: true, count };
}

export async function getConversationsAction() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
  const token = await new SignJWT({ sub: session.user.id, type: "access" })
    .setProtectedHeader({ alg: "HS256" }).setExpirationTime("1h").sign(secret);

  const res = await fetch(`${process.env.FASTAPI_URL || 'http://localhost:8000'}/api/chat/conversations`, {
    headers: { "Authorization": `Bearer ${token}` }
  });

  if (!res.ok) throw new Error("Failed to fetch conversations");
  return await res.json();
}

export async function getConversationMessagesAction(conversationId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
  const token = await new SignJWT({ sub: session.user.id, type: "access" })
    .setProtectedHeader({ alg: "HS256" }).setExpirationTime("1h").sign(secret);

  const res = await fetch(`${process.env.FASTAPI_URL || 'http://localhost:8000'}/api/chat/conversations/${conversationId}`, {
    headers: { "Authorization": `Bearer ${token}` }
  });

  if (!res.ok) throw new Error("Failed to fetch messages");
  return await res.json();
}

export async function runChatAction(message: string, conversationId?: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
  const token = await new SignJWT({ sub: session.user.id, type: "access" })
    .setProtectedHeader({ alg: "HS256" }).setExpirationTime("1h").sign(secret);

  const res = await fetch(`${process.env.FASTAPI_URL || 'http://localhost:8000'}/api/chat`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}` 
    },
    body: JSON.stringify({ message, conversation_id: conversationId })
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Chat engine failed: ${errorText}`);
  }
  return await res.json();
}

export async function deleteConversationAction(conversationId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
  const token = await new SignJWT({ sub: session.user.id, type: "access" })
    .setProtectedHeader({ alg: "HS256" }).setExpirationTime("1h").sign(secret);

  const res = await fetch(`${process.env.FASTAPI_URL || 'http://localhost:8000'}/api/chat/conversations/${conversationId}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` }
  });

  if (!res.ok) throw new Error("Failed to delete conversation");
  return await res.json();
}

export async function searchCustomersAction(query: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  if (!query || query.length < 2) return [];

  const customers = await prisma.customer.findMany({
    where: {
      customer_ref: {
        contains: query,
        mode: 'insensitive'
      }
    },
    take: 5,
    include: {
      predictions: {
        take: 1,
        orderBy: { predicted_at: "desc" }
      }
    }
  });

  return customers.map(c => ({
    id: c.customer_ref,
    internalId: c.id,
    stress: c.predictions[0]?.stress_label || "Unknown",
    esc: c.predictions[0]?.escalation_flag === 1 ? "Escalating" : "Stable"
  }));
}

export async function getRecentAlertsAction() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const alerts = await prisma.prediction.findMany({
    where: {
      OR: [
        { stress_level: { gte: 2 } }, // High
        { escalation_flag: 1 }
      ]
    },
    take: 5,
    orderBy: { predicted_at: "desc" },
    include: {
      customer: true
    }
  });

  return alerts.map(a => ({
    id: a.id,
    customerRef: a.customer.customer_ref,
    stress: a.stress_label,
    action: a.recommended_action,
    date: a.predicted_at.toISOString()
  }));
}
