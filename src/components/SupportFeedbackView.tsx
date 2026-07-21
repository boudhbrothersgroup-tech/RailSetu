import React, { useState, useEffect } from 'react';
import { localDbService, SupportTicket, FeedbackSubmission } from '../services/LocalDbService';
import { LifeBuoy, Star, CheckCircle, ArrowLeft, Send, ShieldAlert, Sparkles, MessageSquare } from 'lucide-react';

interface SupportFeedbackViewProps {
  onNavigate: (route: string, params?: any) => void;
  initialTab?: 'support' | 'feedback';
}

export const SupportFeedbackView: React.FC<SupportFeedbackViewProps> = ({ onNavigate, initialTab = 'support' }) => {
  const [activeTab, setActiveTab] = useState<'support' | 'feedback'>(initialTab);
  
  // Support States
  const [ticketCategory, setTicketCategory] = useState<'booking' | 'bug' | 'general' | 'refund'>('general');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [ticketSuccess, setTicketSuccess] = useState<string | null>(null);
  const [ticketError, setTicketError] = useState<string | null>(null);

  // Feedback States
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbacksList, setFeedbacksList] = useState<FeedbackSubmission[]>([]);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  useEffect(() => {
    setSupportTickets(localDbService.getSupportTickets());
    setFeedbacksList(localDbService.getFeedbacks());
  }, []);

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTicketSuccess(null);
    setTicketError(null);

    try {
      const ticket = localDbService.submitSupportTicket(ticketCategory, ticketSubject, ticketMessage);
      setTicketSuccess(`Support ticket #${ticket.id} registered successfully! A simulated advisor will respond shortly.`);
      setTicketSubject('');
      setTicketMessage('');
      setSupportTickets(localDbService.getSupportTickets());
    } catch (err: any) {
      setTicketError(err.message || 'Failed to submit ticket.');
    }
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackSuccess(null);
    setFeedbackError(null);

    try {
      const f = localDbService.submitFeedback(feedbackRating, feedbackText);
      setFeedbackSuccess('Thank you! Your feedback helps us improve RailSetu.');
      setFeedbackText('');
      setFeedbackRating(5);
      setFeedbacksList(localDbService.getFeedbacks());
    } catch (err: any) {
      setFeedbackError(err.message || 'Failed to submit feedback.');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-y-auto">
      {/* AppBar */}
      <div className="bg-[#0D47A1] text-white px-4 py-3 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LifeBuoy className="w-5 h-5 text-white" />
          <span className="font-bold text-sm font-sans">Support & Feedback Desk</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 bg-white border-b border-slate-100 text-xs text-center font-bold">
        <button
          onClick={() => setActiveTab('support')}
          className={`py-2.5 transition-colors flex items-center justify-center gap-1.5 ${activeTab === 'support' ? 'text-[#0D47A1] border-b-2 border-[#0D47A1]' : 'text-slate-400'}`}
        >
          <LifeBuoy className="w-4 h-4" />
          <span>Contact Support</span>
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`py-2.5 transition-colors flex items-center justify-center gap-1.5 ${activeTab === 'feedback' ? 'text-[#0D47A1] border-b-2 border-[#0D47A1]' : 'text-slate-400'}`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Submit Feedback</span>
        </button>
      </div>

      <div className="p-4 space-y-4">
        {activeTab === 'support' ? (
          /* SUPPORT VIEW */
          <div className="space-y-4">
            <form onSubmit={handleSupportSubmit} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm space-y-3">
              <h3 className="font-bold text-xs text-slate-700">Open a Helpdesk Ticket</h3>

              {ticketError && (
                <div className="p-2.5 bg-red-50 border border-red-100 text-red-700 text-[10px] rounded-lg">
                  {ticketError}
                </div>
              )}

              {ticketSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-[10px] rounded-lg font-medium flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{ticketSuccess}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Enquiry Category</label>
                <select
                  value={ticketCategory}
                  onChange={(e: any) => setTicketCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 px-2.5 py-2 rounded-lg text-xs font-bold focus:outline-none"
                >
                  <option value="general">General Rails Enquiry</option>
                  <option value="booking">Ticket Booking Issues</option>
                  <option value="refund">Refund & Cancellation Inquiry</option>
                  <option value="bug">Application Bug Report</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Live tracking accuracy issue"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 px-2.5 py-2 rounded-lg text-xs font-bold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Detailed Description</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Please specify train numbers, stations, or PNR details for immediate resolution..."
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 px-2.5 py-2 rounded-lg text-xs font-bold focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#0D47A1] hover:bg-blue-800 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Support Ticket</span>
              </button>
            </form>

            {/* Existing Tickets */}
            {supportTickets.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider pl-1">Your Support History</h4>
                {supportTickets.map((t, idx) => (
                  <div key={idx} className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm space-y-2">
                    <div className="flex justify-between items-center text-[9px]">
                      <span className="font-mono text-slate-400">ID: {t.id}</span>
                      <span className={`px-2 py-0.5 font-bold rounded ${
                        t.status === 'Open' ? 'bg-blue-50 text-blue-700 border' : 'bg-emerald-50 text-emerald-700'
                      }`}>{t.status}</span>
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-800">{t.subject}</h4>
                      <p className="text-[10px] text-slate-500 mt-1 leading-normal">{t.message}</p>
                    </div>
                    <div className="text-[8px] text-slate-400 font-mono text-right">
                      Logged: {new Date(t.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* FEEDBACK VIEW */
          <div className="space-y-4">
            <form onSubmit={handleFeedbackSubmit} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm space-y-4">
              <div className="flex items-center gap-1.5 text-slate-700">
                <Sparkles className="w-5 h-5 text-[#FF9800]" />
                <h3 className="font-bold text-xs">Rate Your Experience</h3>
              </div>

              {feedbackError && (
                <div className="p-2.5 bg-red-50 border border-red-100 text-red-700 text-[10px] rounded-lg">
                  {feedbackError}
                </div>
              )}

              {feedbackSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-[10px] rounded-lg font-medium flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{feedbackSuccess}</span>
                </div>
              )}

              {/* Star Rating Selection */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Select Rating</label>
                <div className="flex gap-2.5 justify-center py-2.5 border border-dashed border-slate-150 rounded-xl bg-slate-50">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setFeedbackRating(star)}
                      className="p-1 transition-all duration-150 transform hover:scale-110"
                    >
                      <Star className={`w-8 h-8 ${feedbackRating >= star ? 'text-[#FF9800] fill-[#FF9800]' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Write a Brief Feedback</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tell us what you like or what we can build better next on RailSetu..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 px-2.5 py-2 rounded-lg text-xs font-bold focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#0D47A1] hover:bg-blue-800 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Secure Feedback</span>
              </button>
            </form>

            {/* List of past Feedbacks */}
            {feedbacksList.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider pl-1">Your App Ratings</h4>
                {feedbacksList.map((f, idx) => (
                  <div key={idx} className="bg-white rounded-xl p-3.5 border border-slate-100 shadow-sm space-y-1.5">
                    <div className="flex justify-between items-center">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`w-3.5 h-3.5 ${f.rating >= s ? 'text-[#FF9800] fill-[#FF9800]' : 'text-slate-200'}`} />
                        ))}
                      </div>
                      <span className="text-[8px] text-slate-400 font-mono">{new Date(f.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 italic">"{f.text}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
