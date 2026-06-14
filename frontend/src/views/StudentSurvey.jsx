import React, { useState } from 'react';
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  User, 
  Book, 
  Award, 
  Users, 
  AlertCircle 
} from 'lucide-react';
import { 
  SURVEY_QUESTIONS, 
  GPA_MIN_VALUE, 
  GPA_MAX_VALUE,
  MUSAITLIK_OPTIONS,
  ILETISIM_OPTIONS,
  ARAC_OPTIONS
} from '../constants/options';

function StudentSurvey({ courseId }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    ogrenci_id: '',
    ad_soyad: '',
    gpa: '',
    istenen_arkadas_id: '',
    anket: {
      musaitlik_zamani: [],
      iletisim_formati: [],
      haftalik_efor_saati: '',
      calisma_tarzi: '',
      check_in_sikligi: '',
      karar_alma_mekanizmasi: '',
      kullanilan_araclar: []
    }
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jsonResult, setJsonResult] = useState('');

  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSingleSelect = (questionId, value) => {
    setFormData(prev => ({
      ...prev,
      anket: {
        ...prev.anket,
        [questionId]: value
      }
    }));
    if (errors[questionId]) {
      setErrors(prev => ({ ...prev, [questionId]: null }));
    }
  };

  const handleMultiSelect = (questionId, value) => {
    setFormData(prev => {
      const currentSelections = prev.anket[questionId] || [];
      const updatedSelections = currentSelections.includes(value)
        ? currentSelections.filter(item => item !== value)
        : [...currentSelections, value];

      return {
        ...prev,
        anket: {
          ...prev.anket,
          [questionId]: updatedSelections
        }
      };
    });
    if (errors[questionId]) {
      setErrors(prev => ({ ...prev, [questionId]: null }));
    }
  };

  const validateStep1 = () => {
    const step1Errors = {};
    if (!formData.ad_soyad.trim()) {
      step1Errors.ad_soyad = "Ad Soyad alanı zorunludur.";
    }
    if (!formData.ogrenci_id) {
      step1Errors.ogrenci_id = "Öğrenci numarası zorunludur.";
    }
    
    const gpaFloat = parseFloat(formData.gpa);
    if (isNaN(gpaFloat) || gpaFloat < GPA_MIN_VALUE || gpaFloat > GPA_MAX_VALUE) {
      step1Errors.gpa = `GPA, ${GPA_MIN_VALUE} ile ${GPA_MAX_VALUE} arasında geçerli bir sayı olmalıdır.`;
    }

    if (formData.istenen_arkadas_id && formData.ogrenci_id && formData.istenen_arkadas_id === formData.ogrenci_id) {
      step1Errors.istenen_arkadas_id = "Kendi öğrenci numaranızı arkadaş tercihi olarak giremezsiniz.";
    }

    setErrors(step1Errors);
    return Object.keys(step1Errors).length === 0;
  };

  const validateStep2 = () => {
    const step2Errors = {};
    SURVEY_QUESTIONS.forEach(q => {
      const val = formData.anket[q.id];
      if (q.type === 'multi') {
        if (!val || val.length === 0) {
          step2Errors[q.id] = "Lütfen en az bir seçenek seçiniz.";
        }
      } else {
        if (!val) {
          step2Errors[q.id] = "Lütfen bir seçenek seçiniz.";
        }
      }
    });

    setErrors(step2Errors);
    return Object.keys(step2Errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;

    // Helper: Map/join multi-select values into a single string for backend compliance
    const formatSurveyAnswers = () => {
      const formatted = {};
      SURVEY_QUESTIONS.forEach(q => {
        const val = formData.anket[q.id];
        if (q.type === 'multi') {
          if (q.id === 'musaitlik_zamani') {
            const hasHaftaIci = val.includes(MUSAITLIK_OPTIONS.HAFTA_ICI);
            const hasHaftaSonu = val.includes(MUSAITLIK_OPTIONS.HAFTA_SONU);
            const hasHerIkisi = val.includes(MUSAITLIK_OPTIONS.HER_IKISI);
            
            if (hasHerIkisi || (hasHaftaIci && hasHaftaSonu)) {
              formatted[q.id] = MUSAITLIK_OPTIONS.HER_IKISI;
            } else if (hasHaftaIci) {
              formatted[q.id] = MUSAITLIK_OPTIONS.HAFTA_ICI;
            } else if (hasHaftaSonu) {
              formatted[q.id] = MUSAITLIK_OPTIONS.HAFTA_SONU;
            } else {
              formatted[q.id] = MUSAITLIK_OPTIONS.HER_IKISI;
            }
          } else if (q.id === 'iletisim_formati') {
            const hasYuzYuze = val.includes(ILETISIM_OPTIONS.YUZ_YUZE);
            const hasOnline = val.includes(ILETISIM_OPTIONS.ONLINE);
            const hasHibrit = val.includes(ILETISIM_OPTIONS.HIBRIT);
            
            if (hasHibrit || (hasYuzYuze && hasOnline) || val.length > 1) {
              formatted[q.id] = ILETISIM_OPTIONS.HIBRIT;
            } else if (hasYuzYuze) {
              formatted[q.id] = ILETISIM_OPTIONS.YUZ_YUZE;
            } else if (hasOnline) {
              formatted[q.id] = ILETISIM_OPTIONS.ONLINE;
            } else {
              formatted[q.id] = ILETISIM_OPTIONS.HIBRIT;
            }
          } else if (q.id === 'kullanilan_araclar') {
            const hasHepsi = val.includes(ARAC_OPTIONS.HEPSI);
            
            if (hasHepsi || val.length > 1) {
              formatted[q.id] = ARAC_OPTIONS.HEPSI;
            } else if (val.length === 1) {
              formatted[q.id] = val[0];
            } else {
              formatted[q.id] = ARAC_OPTIONS.HEPSI;
            }
          } else {
            formatted[q.id] = val.join(' ve ');
          }
        } else {
          formatted[q.id] = val;
        }
      });
      return formatted;
    };

    const payload = {
      ogrenci_id: parseInt(formData.ogrenci_id),
      ad_soyad: formData.ad_soyad.trim(),
      gpa: parseFloat(formData.gpa),
      ders_id: courseId,
      istenen_arkadas_id: formData.istenen_arkadas_id ? parseInt(formData.istenen_arkadas_id) : null,
      anket: formatSurveyAnswers()
    };

    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:8000/api/ogrenci/anket-kaydet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Sunucu veriyi kabul etmedi.');
      }

      setSubmitted(true);
    } catch (err) {
      alert('Anket kaydedilirken hata oluştu: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="w-full max-w-lg p-8 md:p-12 rounded-3xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl shadow-2xl flex flex-col items-center justify-center text-center">
        <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-6">
          <CheckCircle className="h-10 w-10 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Başarıyla Tamamlandı!</h2>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          Grup eşleştirme anket cevaplarınız başarıyla kaydedilmiştir. Tercihlerinize uygun gruplar oluşturulduğunda eğitmeniniz tarafından bilgilendirileceksiniz.
        </p>

        <button
          onClick={() => window.location.href = '/'}
          className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 active:scale-[0.98] shadow-lg shadow-violet-500/20 transition-all duration-200 text-sm uppercase tracking-wide"
        >
          Anasayfaya Dön
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl p-6 md:p-10 rounded-3xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl shadow-2xl transition-all duration-300">
      {/* Wizard progress header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-800/80">
        <div>
          <span className="text-xs font-semibold text-violet-400 tracking-wider uppercase">Anket Kaydı</span>
          <h1 className="text-xl md:text-2xl font-extrabold text-white">{courseId} Grup Tercih Anketi</h1>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`h-2.5 w-2.5 rounded-full ${step === 1 ? 'bg-violet-500' : 'bg-slate-700'}`}></span>
          <span className={`h-2.5 w-2.5 rounded-full ${step === 2 ? 'bg-violet-500' : 'bg-slate-700'}`}></span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 1 ? (
          // Step 1: Personal Information
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-slate-300 mb-4 flex items-center space-x-2">
              <User className="h-5 w-5 text-violet-400" />
              <span>Adım 1: Kişisel Bilgiler</span>
            </h2>

            {/* Ad Soyad */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 tracking-wider uppercase">Ad Soyad</label>
              <div className="relative">
                <input
                  type="text"
                  name="ad_soyad"
                  value={formData.ad_soyad}
                  onChange={handlePersonalChange}
                  className={`w-full py-3 px-4 rounded-xl bg-slate-950 border ${errors.ad_soyad ? 'border-rose-500/50 focus:border-rose-500' : 'border-slate-800 focus:border-violet-500'} text-slate-100 placeholder-slate-600 focus:outline-none transition-colors duration-200 text-sm`}
                  placeholder="Örn: Alice Smith"
                />
              </div>
              {errors.ad_soyad && (
                <p className="text-rose-400 text-xs flex items-center space-x-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{errors.ad_soyad}</span>
                </p>
              )}
            </div>

            {/* Ogrenci No */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 tracking-wider uppercase">Öğrenci Numarası</label>
                <input
                  type="number"
                  name="ogrenci_id"
                  value={formData.ogrenci_id}
                  onChange={handlePersonalChange}
                  className={`w-full py-3 px-4 rounded-xl bg-slate-950 border ${errors.ogrenci_id ? 'border-rose-500/50 focus:border-rose-500' : 'border-slate-800 focus:border-violet-500'} text-slate-100 placeholder-slate-600 focus:outline-none transition-colors duration-200 text-sm`}
                  placeholder="Örn: 220101001"
                />
                {errors.ogrenci_id && (
                  <p className="text-rose-400 text-xs flex items-center space-x-1 mt-1">
                    <AlertCircle className="h-3 w-3" />
                    <span>{errors.ogrenci_id}</span>
                  </p>
                )}
              </div>

              {/* GPA */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 tracking-wider uppercase">Genel Ortalama (GPA)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    name="gpa"
                    value={formData.gpa}
                    onChange={handlePersonalChange}
                    className={`w-full py-3 px-4 rounded-xl bg-slate-950 border ${errors.gpa ? 'border-rose-500/50 focus:border-rose-500' : 'border-slate-800 focus:border-violet-500'} text-slate-100 placeholder-slate-600 focus:outline-none transition-colors duration-200 text-sm`}
                    placeholder="Örn: 3.85"
                  />
                  <span className="absolute right-4 top-3 text-xs font-bold text-slate-500">/ 4.00</span>
                </div>
                {errors.gpa && (
                  <p className="text-rose-400 text-xs flex items-center space-x-1 mt-1">
                    <AlertCircle className="h-3 w-3" />
                    <span>{errors.gpa}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Birlikte Calismak Istedigi Arkadas No */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 tracking-wider uppercase flex justify-between">
                <span>İstenen Arkadaş Öğrenci No</span>
                <span className="text-slate-500 font-normal italic">İsteğe Bağlı</span>
              </label>
              <input
                type="number"
                name="istenen_arkadas_id"
                value={formData.istenen_arkadas_id}
                onChange={handlePersonalChange}
                className={`w-full py-3 px-4 rounded-xl bg-slate-950 border ${errors.istenen_arkadas_id ? 'border-rose-500/50 focus:border-rose-500' : 'border-slate-800 focus:border-violet-500'} text-slate-100 placeholder-slate-600 focus:outline-none transition-colors duration-200 text-sm`}
                placeholder="Arkadaşınızın Öğrenci Numarası"
              />
              {errors.istenen_arkadas_id && (
                <p className="text-rose-400 text-xs flex items-center space-x-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{errors.istenen_arkadas_id}</span>
                </p>
              )}
            </div>

            {/* Next step button */}
            <div className="pt-6">
              <button
                type="button"
                onClick={handleNext}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 active:scale-[0.98] shadow-lg shadow-violet-500/20 transition-all duration-200 flex items-center justify-center space-x-2 text-sm uppercase tracking-wider"
              >
                <span>Sonraki Adıma Geç</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          // Step 2: Survey Questions
          <div className="space-y-8">
            <h2 className="text-lg font-bold text-slate-300 mb-2 flex items-center space-x-2">
              <Award className="h-5 w-5 text-violet-400" />
              <span>Adım 2: Grup Tercih Soruları</span>
            </h2>

            {SURVEY_QUESTIONS.map((q) => {
              const currentSelections = formData.anket[q.id];
              return (
                <div key={q.id} className="space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-bold text-slate-300">{q.title}</span>
                    <span className="text-[10px] text-slate-500 font-semibold tracking-wide uppercase">
                      {q.type === 'multi' ? 'Çoklu Seçim' : 'Tek Seçim'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {q.options.map((opt) => {
                      const isSelected = q.type === 'multi' 
                        ? currentSelections.includes(opt.value)
                        : currentSelections === opt.value;

                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            if (q.type === 'multi') {
                              handleMultiSelect(q.id, opt.value);
                            } else {
                              handleSingleSelect(q.id, opt.value);
                            }
                          }}
                          className={`p-4 rounded-2xl text-left border transition-all duration-200 ${
                            isSelected
                              ? 'bg-violet-600/10 border-violet-500 text-white shadow-lg shadow-violet-500/5'
                              : 'bg-slate-950/60 border-slate-850 hover:border-slate-700 text-slate-400 hover:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            {/* Visual select dot/box */}
                            <div className={`h-5 w-5 rounded-md border flex items-center justify-center shrink-0 ${
                              isSelected 
                                ? 'bg-violet-500 border-violet-500 text-white' 
                                : 'border-slate-700 bg-slate-950'
                            }`}>
                              {isSelected && <span className="text-[10px] font-black">✓</span>}
                            </div>
                            <span className="text-xs font-semibold leading-snug">{opt.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {errors[q.id] && (
                    <p className="text-rose-400 text-xs flex items-center space-x-1 mt-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{errors[q.id]}</span>
                    </p>
                  )}
                </div>
              );
            })}

            {/* Footer actions */}
            <div className="flex space-x-4 pt-6 border-t border-slate-800/80">
              <button
                type="button"
                onClick={handleBack}
                className="w-1/3 py-3.5 px-4 rounded-xl font-bold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 active:scale-[0.98] transition-all duration-200 flex items-center justify-center space-x-2 text-sm uppercase tracking-wider"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Geri Dön</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-2/3 py-3.5 px-6 rounded-xl font-bold text-white transition-all duration-200 flex items-center justify-center space-x-2 text-sm uppercase tracking-wider
                  ${isSubmitting ? 'bg-slate-700 cursor-wait' : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 active:scale-[0.98] shadow-lg shadow-violet-500/20'}`}
              >
                <span>{isSubmitting ? 'Gönderiliyor...' : 'Formu Gönder'}</span>
                {!isSubmitting && <CheckCircle className="h-4 w-4" />}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

export default StudentSurvey;
