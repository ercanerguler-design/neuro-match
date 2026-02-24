import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from 'react-query';
import toast from 'react-hot-toast';
import { coachAPI } from '../services/api';
import MainLayout from '../components/MainLayout';
import useAuthStore from '../store/authStore';

export default function CoachPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useAuthStore();

  const { data: weeklyData } = useQuery('weekly-insights', coachAPI.getWeeklyInsights, {
    select: (res) => res.data.data,
  });

  useEffect(() => {
    // Welcome message
    setMessages([{
      id: 1,
      role: 'assistant',
      content: `Merhaba ${user?.name?.split(' ')[0]}! 👋 Ben senin kişisel AI koçunum.\n\nBeyin tipin **${user?.neuroProfile?.brainType || 'henüz belirlenmedi'}** profiline göre sana özel rehberlik sunuyorum. Bugün sana nasıl yardımcı olabilirim?`,
      time: new Date(),
    }]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { id: Date.now(), role: 'user', content: input, time: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await coachAPI.askCoach(input);
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: res.data.data.answer,
        time: new Date(),
      }]);
    } catch (err) {
      toast.error('AI koç yanıt veremedi, lütfen tekrar dene');
    } finally {
      setLoading(false);
    }
  };

  const QUICK_PROMPTS = [
    'Bugün ne yapmalıyım?',
    'Stresimi nasıl azaltabilirim?',
    'Kariyer tavsiyesi ver',
    'Sabah rutini öner',
    'Daha iyi kararlar vermek için ne yapmalıyım?',
  ];

  return (
    <MainLayout>
      <div style={{ maxWidth: 900, margin: '0 auto', height: 'calc(100vh - 96px)', display: 'flex', gap: 24 }}>
        {/* Sidebar */}
        <div style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>🤖 AI Koçun</h3>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🧠</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Neuro Coach</div>
                <div style={{ fontSize: 12, color: '#10b981' }}>● Çevrimiçi</div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>
              Beyin tipine göre kişiselleştirilmiş, 7/24 AI koçun.
            </p>
          </div>

          {weeklyData && (
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: 12, fontSize: 15 }}>📊 Bu Hafta</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#94a3b8' }}>Ort. Ruh Hali</span>
                  <span style={{ color: '#00d4ff', fontWeight: 600 }}>{weeklyData.weekSummary.avgMood}/10</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#94a3b8' }}>Ort. Enerji</span>
                  <span style={{ color: '#10b981', fontWeight: 600 }}>{weeklyData.weekSummary.avgEnergy}/10</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#94a3b8' }}>Ort. Uyku</span>
                  <span style={{ color: '#7c3aed', fontWeight: 600 }}>{weeklyData.weekSummary.avgSleep}s</span>
                </div>
              </div>
            </div>
          )}

          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: 12, fontSize: 15 }}>⚡ Hızlı Sorular</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {QUICK_PROMPTS.map((prompt) => (
                <button key={prompt} onClick={() => setInput(prompt)}
                  style={{ textAlign: 'left', background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 8, padding: '8px 10px', fontSize: 12, color: '#94a3b8', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Inter, sans-serif' }}
                  onMouseEnter={(e) => { e.target.style.background = 'rgba(0,212,255,0.1)'; e.target.style.color = '#00d4ff'; }}
                  onMouseLeave={(e) => { e.target.style.background = 'rgba(0,212,255,0.05)'; e.target.style.color = '#94a3b8'; }}>
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
              <span style={{ fontWeight: 600 }}>Neuro Coach</span>
              <span style={{ color: '#64748b', fontSize: 13 }}>Kişiselleştirilmiş AI - GPT-4</span>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {messages.map((msg) => (
                <div key={msg.id} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '80%', padding: '12px 16px', borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: msg.role === 'user' ? 'linear-gradient(135deg, #00d4ff, #7c3aed)' : 'rgba(255,255,255,0.06)',
                    fontSize: 14, lineHeight: 1.7, color: '#fff',
                  }}>
                    {msg.content.split('\n').map((line, i) => (
                      <p key={i} style={{ margin: 0, marginBottom: i < msg.content.split('\n').length - 1 ? 8 : 0 }}>
                        {line.replace(/\*\*(.*?)\*\*/g, '$1')}
                      </p>
                    ))}
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 6 }}>
                      {new Date(msg.time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00d4ff', animation: 'pulse-glow 1s ease infinite' }} />
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00d4ff', animation: 'pulse-glow 1s ease 0.2s infinite' }} />
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00d4ff', animation: 'pulse-glow 1s ease 0.4s infinite' }} />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 12 }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Koçuna bir şey sor..."
                className="form-input"
                style={{ flex: 1 }}
              />
              <button onClick={sendMessage} disabled={loading || !input.trim()} className="btn btn-primary" style={{ flexShrink: 0 }}>
                {loading ? <div className="loading-spinner" /> : '→'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
