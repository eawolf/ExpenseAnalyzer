'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, Check, Save, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import api from '@/utils/api';
import { toast } from 'react-hot-toast';
import { useUserProfile } from '@/context/UserProfileContext';

interface ExtractedTransaction {
  merchant: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  transaction_date: string;
  category: string;
  notes: string;
}

export default function UploadTransactionsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [transactions, setTransactions] = useState<ExtractedTransaction[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { userProfile } = useUserProfile();
  const currencySymbol = userProfile?.currency || '$';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setTransactions(null);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith('image/')) {
        setFile(droppedFile);
        setPreviewUrl(URL.createObjectURL(droppedFile));
        setTransactions(null);
        setError(null);
      } else {
        toast.error('Please upload an image file.');
      }
    }
  };

  const processImage = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      // Call our new Python vision-service directly (port 8000)
      const res = await fetch('http://localhost:8000/api/vision/extract-transactions', {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) {
        throw new Error('Failed to extract transactions. Ensure the Vision Service is running and GEMINI_API_KEY is valid.');
      }
      
      const data = await res.json();
      
      // Fetch existing transactions to filter duplicates
      try {
        const [expensesRes, incomesRes] = await Promise.all([
          api.get('/expenses'),
          api.get('/incomes')
        ]);
        const existingExpenses = expensesRes.data || [];
        const existingIncomes = incomesRes.data || [];
        
        const uniqueData = data.filter((t: any) => {
          if (t.type === 'INCOME') {
            return !existingIncomes.some((inc: any) => 
              inc.amount === Number(t.amount) && 
              inc.source?.toLowerCase() === t.merchant?.toLowerCase() &&
              inc.transactionDate?.startsWith(t.transaction_date)
            );
          } else {
            return !existingExpenses.some((exp: any) => 
              exp.amount === Number(t.amount) && 
              exp.merchant?.toLowerCase() === t.merchant?.toLowerCase() &&
              exp.transactionDate?.startsWith(t.transaction_date)
            );
          }
        });
        
        if (uniqueData.length < data.length) {
          toast.success(`Extracted ${data.length} transactions. Removed ${data.length - uniqueData.length} duplicates!`);
        } else {
          toast.success(`Successfully extracted ${data.length} transactions!`);
        }
        setTransactions(uniqueData);
      } catch (err) {
        console.error("Failed to fetch existing transactions for deduplication", err);
        setTransactions(data);
        toast.success(`Successfully extracted ${data.length} transactions!`);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during extraction.');
      toast.error('Extraction failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const updateTransaction = (index: number, field: keyof ExtractedTransaction, value: string | number) => {
    if (!transactions) return;
    const updated = [...transactions];
    (updated[index] as any)[field] = value;
    setTransactions(updated);
  };

  const removeTransaction = (index: number) => {
    if (!transactions) return;
    const updated = [...transactions];
    updated.splice(index, 1);
    setTransactions(updated);
  };

  const handleSaveAll = async () => {
    if (!transactions || transactions.length === 0) return;
    
    setIsSaving(true);
    let successCount = 0;
    
    try {
      // Save each transaction to the expense-service or income endpoint
      for (const t of transactions) {
        if (t.type === 'INCOME') {
          await api.post('/incomes', {
            amount: parseFloat(String(t.amount).replace(/[^0-9.]/g, '')) || 0,
            source: t.merchant,
            transactionDate: t.transaction_date ? `${t.transaction_date}T12:00:00` : undefined,
          });
        } else {
          await api.post('/expenses', {
            amount: parseFloat(String(t.amount).replace(/[^0-9.]/g, '')) || 0,
            merchant: t.merchant,
            categories: [t.category || 'Miscellaneous'],
            transactionDate: t.transaction_date ? `${t.transaction_date}T12:00:00` : undefined,
            notes: t.notes || 'Imported via Screenshot',
          });
        }
        successCount++;
      }
      
      toast.success(`Successfully saved ${successCount} transactions!`);
      router.push('/dashboard');
    } catch (err) {
      console.error('Failed to save some transactions', err);
      toast.error(`Saved ${successCount} out of ${transactions.length}. Some failed.`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[--color-primary] to-[--color-secondary]">
              Upload Transactions
            </h1>
            <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/30 uppercase tracking-widest shadow-sm">Beta</span>
          </div>
          <p className="text-[--color-text-muted] mt-2">
            Upload a screenshot of your UPI app (e.g. GPay) to automatically extract your expenses using AI.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upload Section */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-panel p-6">
            <h2 className="text-xl font-semibold mb-4 text-[--color-text]">Upload Screenshot</h2>
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 
                ${file ? 'border-[--color-primary] bg-[--color-primary]/5' : 'border-[--color-border] hover:border-[--color-primary]/50 hover:bg-[--color-surface-hover]'}`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
              
              {previewUrl ? (
                <div className="relative w-full aspect-[9/16] rounded-lg overflow-hidden border border-[--color-border]">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <p className="text-white font-medium">Click to change image</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="h-16 w-16 rounded-full bg-[--color-primary]/10 flex items-center justify-center text-[--color-primary] mb-4">
                    <Upload size={32} />
                  </div>
                  <p className="text-[--color-text] font-medium mb-1">Click or drag image here</p>
                  <p className="text-sm text-[--color-text-muted]">Supports PNG, JPG, JPEG</p>
                </>
              )}
            </div>

            {file && !transactions && (
              <button
                onClick={processImage}
                disabled={isProcessing}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:pointer-events-none w-full mt-6 py-3"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center">
                    <Loader2 size={18} className="animate-spin mr-2" />
                    Extracting with AI...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <ImageIcon size={18} className="mr-2" />
                    Extract Transactions
                  </span>
                )}
              </button>
            )}

            {error && (
              <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-start">
                <AlertCircle size={20} className="mr-3 shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-2">
          <div className="glass-panel p-6 h-full flex flex-col">
            <h2 className="text-xl font-semibold mb-4 text-[--color-text]">Extracted Data</h2>
            
            {!transactions ? (
              <div className="flex-1 flex flex-col items-center justify-center text-[--color-text-muted] min-h-[400px]">
                {isProcessing ? (
                  <>
                    <Loader2 size={48} className="animate-spin text-[--color-primary] mb-4" />
                    <p>Our AI is analyzing the screenshot...</p>
                  </>
                ) : (
                  <>
                    <ImageIcon size={48} className="mb-4 opacity-30" />
                    <p>Upload and process an image to see results here.</p>
                  </>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                <div className="overflow-x-auto flex-1 border border-[--color-border] rounded-xl mb-6">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[--color-surface-hover] text-[--color-text-muted] text-sm uppercase tracking-wider">
                        <th className="px-4 py-3 font-medium text-muted-foreground w-32">DATE</th>
                        <th className="px-4 py-3 font-medium text-muted-foreground">MERCHANT</th>
                        <th className="px-4 py-3 font-medium text-muted-foreground w-40">TYPE</th>
                        <th className="px-4 py-3 font-medium text-muted-foreground w-40">CATEGORY</th>
                        <th className="px-4 py-3 font-medium text-muted-foreground w-32 text-right">AMOUNT</th>
                        <th className="px-4 py-3 w-16"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[--color-border]">
                      {transactions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-[--color-text-muted]">
                            No new transactions found in this image.
                          </td>
                        </tr>
                      ) : (
                        transactions.map((t, idx) => (
                          <tr key={idx} className="hover:bg-[--color-surface-hover]/50 transition-colors">
                            <td className="px-4 py-3">
                              <input 
                                type="date" 
                                value={t.transaction_date}
                                onChange={(e) => updateTransaction(idx, 'transaction_date', e.target.value)}
                                className="bg-[--color-input] border border-[--color-border] rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-[--color-primary]/50 transition-all text-[--color-foreground] py-2 text-sm w-full"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input 
                                type="text" 
                                value={t.merchant}
                                onChange={(e) => updateTransaction(idx, 'merchant', e.target.value)}
                                className="bg-[--color-input] border border-[--color-border] rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-[--color-primary]/50 transition-all text-[--color-foreground] py-2 text-sm w-full"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${t.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                {t.type}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <input 
                                type="text"
                                className="bg-[--color-input] border border-[--color-border] rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-[--color-primary]/50 transition-all text-[--color-foreground] py-2 text-sm w-full"
                                value={t.category}
                                onChange={(e) => updateTransaction(idx, 'category', e.target.value)}
                                disabled={t.type === 'INCOME'}
                              />
                            </td>
                            <td className="px-4 py-3">
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[--color-text-muted] text-sm">
                                  {userProfile?.currency || '₹'}
                                </span>
                                <input 
                                  type="number" 
                                  value={t.amount}
                                  onChange={(e) => updateTransaction(idx, 'amount', parseFloat(e.target.value) || 0)}
                                  className="bg-[--color-input] border border-[--color-border] rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-[--color-primary]/50 transition-all text-[--color-foreground] py-2 pl-8 text-sm w-full font-medium text-right"
                                />
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button 
                                onClick={() => removeTransaction(idx)}
                                className="text-[--color-text-muted] hover:text-red-500 p-2 rounded-full hover:bg-red-500/10 transition-colors"
                              >
                                <X size={16} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-center bg-[--color-primary]/5 p-4 rounded-xl border border-[--color-primary]/20">
                  <p className="text-[--color-text] font-medium">
                    {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} ready to save
                  </p>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setTransactions(null)}
                      className="bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 font-semibold rounded-xl transition-all shadow-sm hover:shadow active:scale-95 border border-zinc-700 disabled:opacity-50 disabled:pointer-events-none py-2 px-6"
                      disabled={isSaving}
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveAll}
                      disabled={transactions.length === 0 || isSaving}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:pointer-events-none py-2 px-8 flex items-center"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 size={18} className="animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check size={18} className="mr-2" />
                          Confirm & Save All
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
