"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, CheckCircle, TrendingUp, AlertTriangle, Loader2, Upload, Plus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { getCustomersAction, registerBulkCustomersAction, runPredictionAction } from "@/app/actions";
import * as xlsx from "xlsx";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const [uploading, setUploading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [runningPredict, setRunningPredict] = useState(false);

  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const [filterQuery, setFilterQuery] = useState(initialSearch);

  // Sync filterQuery when URL search param changes
  useEffect(() => {
    if (initialSearch) setFilterQuery(initialSearch);
  }, [initialSearch]);

  const fetchCustomers = () => {
    setLoading(true);
    getCustomersAction().then((data) => {
      setCustomers(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Filtered customers based on local search box or URL param
  const filteredCustomers = customers.filter(c => 
    c.id.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = xlsx.read(data, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const json: any[] = xlsx.utils.sheet_to_json(worksheet);

      if (json.length === 0) throw new Error("Empty file or unrecognized format");
      
      const res = await registerBulkCustomersAction(json);
      if (res.success) {
        alert(`Successfully imported ${res.count} customers!`);
        fetchCustomers();
      }
    } catch (err: any) {
      console.error(err);
      alert("Error uploading file: " + err.message);
    } finally {
      setUploading(false);
      e.target.value = ''; // clear input
    }
  };

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAddLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const row = {
      "Customer Ref": formData.get("customer_ref"),
      "Limit Balance": formData.get("limit_bal"),
      "Age": formData.get("age"),
      "Sex": formData.get("sex"),
      "Education": formData.get("education"),
      "Marriage": formData.get("marriage"),
      "Avg Utilization": formData.get("avg_utilization"),
      "Pay Delay Trend": formData.get("pay_delay_trend")
    };
    
    try {
      const res = await registerBulkCustomersAction([row]);
      if (res.success) {
        setIsAddModalOpen(false);
        fetchCustomers();
      }
    } catch (err: any) {
      alert("Error adding customer: " + err.message);
    } finally {
      setAddLoading(false);
    }
  };

  const handlePredict = async () => {
    if (!selectedCustomer?.internalId) return;
    setRunningPredict(true);
    try {
      await runPredictionAction(selectedCustomer.internalId);
      // alert("Prediction finished successfully. Refreshing customer data.");
      fetchCustomers();
      setSelectedCustomer(null); // Close sidebar so they can see the updated table row
    } catch (err: any) {
      alert("Predict Error: " + err.message);
    } finally {
      setRunningPredict(false);
    }
  };

  return (
    <div className="w-full flex">
      {/* Main Table Content */}
      <div className={`w-full transition-all duration-300 ${selectedCustomer ? "pr-[480px]" : ""}`}>

        {/* Filters */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex gap-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-text" />
              <input
                type="text"
                placeholder="Search by customer ID..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-lg bg-[#111111] border border-[#1F1F1F] text-sm text-primary-text w-[300px] focus:outline-none focus:border-primary/50"
              />
            </div>
            
            <button
              onClick={() => setIsAddModalOpen(true)}
              aria-label="Add new customer"
              className="px-4 py-2 bg-primary text-white hover:bg-primary/90 transition-colors rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <Plus size={16} />
              Add Customer
            </button>
            
            <label aria-label="Bulk upload customer data from Excel or CSV" className="cursor-pointer px-4 py-2 bg-[#171717] border border-[#1F1F1F] hover:bg-primary/20 hover:text-primary transition-colors rounded-lg text-sm font-medium flex items-center gap-2">
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              {uploading ? "Importing..." : "Bulk Upload"}
              <input type="file" accept=".xlsx, .xls, .csv" className="hidden" onChange={handleFileUpload} disabled={uploading} />
            </label>
          </div>

          <div className="flex bg-[#111111] p-1 rounded-lg border border-[#1F1F1F]">
            <button aria-label="Filter by all customers" className="px-4 py-1.5 rounded-md text-xs font-medium bg-primary text-inverse">All</button>
            <button aria-label="Filter by high stress customers" className="px-4 py-1.5 rounded-md text-xs font-medium text-secondary-text hover:text-primary-text">High Stress</button>
            <button aria-label="Filter by escalating customers" className="px-4 py-1.5 rounded-md text-xs font-medium text-secondary-text hover:text-primary-text">Escalating</button>
          </div>
        </div>

        {/* Table */}
        <div className="glass rounded-xl overflow-hidden">
          <table className="w-full text-left font-sans text-sm">
            <thead className="bg-[#111111]/50 text-xs text-muted-text uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Ref ID</th>
                <th className="px-6 py-4 font-medium">Credit Limit</th>
                <th className="px-6 py-4 font-medium">Stress</th>
                <th className="px-6 py-4 font-medium">Action</th>
                <th className="px-6 py-4 font-medium text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={5} className="py-8 text-center text-muted-text"><Loader2 className="animate-spin inline-block mr-2" size={16} /> Fetching records...</td></tr>
              ) : filteredCustomers.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-muted-text">No customers found.</td></tr>
              ) : filteredCustomers.map((cust, i) => (
                <tr key={i} className="hover:bg-[#111111] transition-colors group cursor-pointer" onClick={() => setSelectedCustomer(cust)}>
                  <td className="px-6 py-4 font-mono text-primary-text">{cust.id}</td>
                  <td className="px-6 py-4 font-mono">${cust.limit.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${cust.stress === 'High' ? 'bg-risk-critical/10 text-risk-critical border-risk-critical/20' : cust.stress === 'Medium' ? 'bg-risk-medium/10 text-risk-medium border-risk-medium/20' : cust.stress === 'Unknown' ? 'bg-white/10 text-white border-white/20' : 'bg-risk-low/10 text-risk-low border-risk-low/20'}`}>
                      {cust.stress}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-xs text-secondary-text">{cust.action}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="px-3 py-1.5 rounded bg-[#171717] border border-[#1F1F1F] text-secondary-text hover:bg-primary/20 hover:text-primary transition-colors text-xs">
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side Panel */}
      <AnimatePresence>
        {selectedCustomer && (
          <motion.div
            initial={{ x: 480, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 480, opacity: 0 }}
            transition={{ duration: 0.3, ease: "circOut" }}
            className="fixed top-0 right-0 bottom-0 w-[480px] bg-[#111111] border-l border-[#1F1F1F] shadow-[-20px_0_40px_rgba(0,0,0,0.5)] z-40 overflow-y-auto"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#111111]/90 backdrop-blur z-10">
              <div>
                <h2 className="font-display font-semibold text-xl text-primary-text">{selectedCustomer.id}</h2>
                <p className="text-secondary-text text-xs space-x-2">
                  <span>Age: {selectedCustomer.age}</span>
                  <span className="text-white/20">|</span>
                  <span className="font-mono">Limit: ${selectedCustomer.limit.toLocaleString()}</span>
                </p>
              </div>
              <button
                aria-label="Close"
                onClick={() => setSelectedCustomer(null)}
                className="w-8 h-8 rounded-full bg-[#171717] flex items-center justify-center text-muted-text hover:text-primary hover:bg-primary/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6">

              <div className="grid grid-cols-2 gap-4">
                <div className="glass p-4 rounded-xl">
                  <p className="text-xs text-muted-text uppercase font-semibold">Avg Utilization</p>
                  <p className="font-mono text-xl text-primary-text mt-1">{(selectedCustomer.util * 100).toFixed(0)}%</p>
                </div>
                <div className="glass p-4 rounded-xl">
                  <p className="text-xs text-muted-text uppercase font-semibold">Pay Delay Trend</p>
                  <p className="font-mono text-xl text-risk-escalating mt-1">+{selectedCustomer.delay} months</p>
                </div>
              </div>

              <div className="glass p-5 rounded-xl border border-risk-critical/20 bg-risk-critical/5 relative overflow-hidden">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="text-risk-critical" size={18} />
                  <h3 className="font-display font-bold text-risk-critical">Risk Prediction</h3>
                </div>

                <div className="flex justify-between items-end mb-6">
                  <div>
                    <p className="text-sm font-sans text-secondary-text">Escalation Probability</p>
                    <p className="font-mono text-3xl font-light text-primary-text mt-1">{(selectedCustomer.prob * 100).toFixed(1)}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-sans text-secondary-text">Recommended Action</p>
                    <span className={`inline-block mt-1 px-3 py-1 font-bold text-xs rounded-sm ${selectedCustomer.action === 'Restructure' ? 'bg-risk-critical text-inverse shadow-[0_0_15px_rgba(239,68,68,0.3)]' : selectedCustomer.action === 'Alert' ? 'bg-risk-medium text-inverse shadow-[0_0_15px_rgba(234,179,8,0.3)]' : 'bg-[#171717] text-secondary-text'}`}>
                      {selectedCustomer.action.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-text uppercase font-semibold mb-3">AI Narrative</p>
                  <p className="text-sm text-secondary-text leading-relaxed font-sans bg-[#0D0D0D]/50 p-4 rounded-lg border border-white/5 italic">
                    "{selectedCustomer.narrative}"
                  </p>
                </div>

                <button 
                  onClick={handlePredict}
                  disabled={runningPredict}
                  className="w-full mt-6 py-2.5 flex justify-center items-center gap-2 bg-primary/10 text-primary font-semibold text-sm rounded-lg hover:bg-primary hover:text-inverse transition-colors border border-primary/20 disabled:opacity-50"
                >
                  {runningPredict && <Loader2 size={16} className="animate-spin" />}
                  {runningPredict ? "Running Prediction Pipeline..." : "Run New Prediction"}
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#111111] border border-[#1F1F1F] rounded-xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-5 border-b border-white/5 flex justify-between items-center">
                <h3 className="font-display font-semibold text-lg text-primary-text">Add Customer</h3>
                <button 
                  onClick={() => setIsAddModalOpen(false)} 
                  aria-label="Close modal"
                  className="text-muted-text hover:text-primary transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="customer_ref" className="block text-xs font-medium text-secondary-text mb-1">Customer Ref</label>
                    <input id="customer_ref" name="customer_ref" required type="text" className="w-full bg-[#171717] border border-[#1F1F1F] rounded-md px-3 py-2 text-sm text-primary-text focus:outline-none focus:border-primary/50" placeholder="e.g. CUST-01" />
                  </div>
                  <div>
                    <label htmlFor="limit_bal" className="block text-xs font-medium text-secondary-text mb-1">Limit Balance ($)</label>
                    <input id="limit_bal" name="limit_bal" type="number" required defaultValue="50000" className="w-full bg-[#171717] border border-[#1F1F1F] rounded-md px-3 py-2 text-sm text-primary-text focus:outline-none focus:border-primary/50" />
                  </div>
                  <div>
                    <label htmlFor="age" className="block text-xs font-medium text-secondary-text mb-1">Age</label>
                    <input id="age" name="age" type="number" required defaultValue="30" className="w-full bg-[#171717] border border-[#1F1F1F] rounded-md px-3 py-2 text-sm text-primary-text focus:outline-none focus:border-primary/50" />
                  </div>
                  <div>
                    <label htmlFor="sex" className="block text-xs font-medium text-secondary-text mb-1">Sex</label>
                    <select id="sex" name="sex" className="w-full bg-[#171717] border border-[#1F1F1F] rounded-md px-3 py-2 text-sm text-primary-text focus:outline-none focus:border-primary/50">
                      <option value="1">Male</option>
                      <option value="2">Female</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="education" className="block text-xs font-medium text-secondary-text mb-1">Education</label>
                    <select id="education" name="education" className="w-full bg-[#171717] border border-[#1F1F1F] rounded-md px-3 py-2 text-sm text-primary-text focus:outline-none focus:border-primary/50">
                      <option value="1">Grad School</option>
                      <option value="2">University</option>
                      <option value="3">High School</option>
                      <option value="4">Other</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="marriage" className="block text-xs font-medium text-secondary-text mb-1">Marriage</label>
                    <select id="marriage" name="marriage" className="w-full bg-[#171717] border border-[#1F1F1F] rounded-md px-3 py-2 text-sm text-primary-text focus:outline-none focus:border-primary/50">
                      <option value="1">Married</option>
                      <option value="2">Single</option>
                      <option value="3">Other</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="avg_utilization" className="block text-xs font-medium text-secondary-text mb-1">Avg Utilization (0-1+)</label>
                    <input id="avg_utilization" name="avg_utilization" type="number" step="0.01" required defaultValue="0.5" className="w-full bg-[#171717] border border-[#1F1F1F] rounded-md px-3 py-2 text-sm text-primary-text focus:outline-none focus:border-primary/50" />
                  </div>
                  <div>
                    <label htmlFor="pay_delay_trend" className="block text-xs font-medium text-secondary-text mb-1">Pay Delay Trend (months)</label>
                    <input id="pay_delay_trend" name="pay_delay_trend" type="number" step="0.1" required defaultValue="0.0" className="w-full bg-[#171717] border border-[#1F1F1F] rounded-md px-3 py-2 text-sm text-primary-text focus:outline-none focus:border-primary/50" />
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm font-medium text-secondary-text hover:text-primary-text">Cancel</button>
                  <button type="submit" disabled={addLoading} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 flex items-center gap-2">
                    {addLoading && <Loader2 size={16} className="animate-spin" />}
                    Save Customer
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
