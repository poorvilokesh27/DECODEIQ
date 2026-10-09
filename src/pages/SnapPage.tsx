import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Upload, 
  Trash2, 
  Sparkles, 
  AlertCircle, 
  Calendar, 
  MapPin, 
  UserCheck, 
  CheckCircle2, 
  HelpCircle, 
  Bot, 
  Bell, 
  Copy, 
  Lock, 
  RefreshCcw,
  Zap,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import { PosterAnalysis, ReminderItem } from '../types';
import { extractTextFromImage } from '../services/tesseractOCR';
import { analyzePosterText } from '../services/posterAnalyzer';

interface SnapPageProps {
  onSavePosterToHistory: (poster: PosterAnalysis) => void;
  onSavePosterToVault: (poster: PosterAnalysis) => void;
  onCreateReminder: (reminder: ReminderItem) => void;
  onAskMissedAboutPoster: (poster: PosterAnalysis) => void;
}

export const SnapPage: React.FC<SnapPageProps> = ({
  onSavePosterToHistory,
  onSavePosterToVault,
  onCreateReminder,
  onAskMissedAboutPoster,
}) => {
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const [ocrProgress, setOcrProgress] = useState<number>(0);
  const [ocrStatus, setOcrStatus] = useState<string>('');
  const [isReadingText, setIsReadingText] = useState<boolean>(false);
  const [extractedText, setExtractedText] = useState<string>('');

  const [posterResult, setPosterResult] = useState<PosterAnalysis | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [copyNotice, setCopyNotice] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, JPEG, WebP).');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 15 MB limit.');
      return;
    }

    setErrorMsg('');
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setSelectedImageUri(objectUrl);
    setPosterResult(null);
    setExtractedText('');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Camera Access Functions
  const startCamera = async () => {
    setCameraError(null);
    setIsCameraActive(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera Error:', err);
      setCameraError('Camera access unavailable or permission denied. Please upload an image instead.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUri = canvas.toDataURL('image/jpeg');
      setSelectedImageUri(dataUri);
      stopCamera();
      setPosterResult(null);
      setExtractedText('');
    }
  };

  // OCR & Poster Analysis Workflow
  const handleExtractAndAnalyze = async () => {
    if (!selectedImageUri && !extractedText.trim()) {
      setErrorMsg('Please upload an image or enter text to analyze.');
      return;
    }

    setIsReadingText(true);
    setErrorMsg('');

    let textToAnalyze = extractedText;

    if (selectedImageUri && !textToAnalyze) {
      try {
        textToAnalyze = await extractTextFromImage(selectedImageUri, (prog, stat) => {
          setOcrProgress(prog);
          setOcrStatus(stat);
        });
        setExtractedText(textToAnalyze);
      } catch (err) {
        console.warn('OCR extraction warning:', err);
        setErrorMsg('OCR scan complete. If text is missing or partial, please edit the extracted text box below.');
        textToAnalyze = extractedText;
      }
    }

    setIsReadingText(false);

    // Run poster analysis engine
    const analysis = analyzePosterText(textToAnalyze, selectedFile?.name || 'Uploaded Poster');
    if (selectedImageUri) {
      analysis.imageUri = selectedImageUri;
    }
    setPosterResult(analysis);
  };

  const handleCopyText = () => {
    if (extractedText) {
      navigator.clipboard.writeText(extractedText);
      setCopyNotice(true);
      setTimeout(() => setCopyNotice(false), 2000);
    }
  };

  const handleCreateReminderFromPoster = () => {
    if (!posterResult) return;
    const targetDate = posterResult.dateTimes[0] || new Date().toISOString().split('T')[0];
    const newRem: ReminderItem = {
      id: `rem-poster-${Date.now()}`,
      title: `Event Deadline: ${posterResult.title}`,
      description: `Action: ${posterResult.requiredAction}`,
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      priority: 'HIGH',
      status: 'UPCOMING',
      createdAt: new Date().toISOString()
    };
    onCreateReminder(newRem);
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
          <Camera className="w-4 h-4" />
          <span>Snap & Understand Visual OCR Intelligence</span>
        </div>
        <h1 className="text-3xl font-black text-theme-fg tracking-tight">
          Snap & <span className="gradient-text">Understand</span>
        </h1>
        <p className="text-xs text-theme-secondary">
          Upload or capture photos of hackathon posters, exam timetables, event notices, or deadlines. Extract text and decode key details instantly.
        </p>
      </div>

      {/* Upload & Camera Input Section */}
      {!posterResult && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 md:p-8 rounded-3xl space-y-6 gradient-border"
        >
          {/* Upload Drop Zone / Camera Preview */}
          {!isCameraActive ? (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-theme-highlight hover:border-cyan-400 p-8 rounded-2xl text-center space-y-4 bg-theme-bg/50 transition cursor-pointer"
            >
              {selectedImageUri ? (
                <div className="space-y-4">
                  <img
                    src={selectedImageUri}
                    alt="Poster Preview"
                    className="max-h-72 mx-auto rounded-xl shadow-glass border border-theme"
                  />
                  <div className="flex flex-wrap justify-center gap-3">
                    <button
                      onClick={() => { setSelectedImageUri(null); setSelectedFile(null); setExtractedText(''); }}
                      className="px-4 py-2 rounded-xl glass-panel text-xs text-coral-400 font-semibold hover:bg-coral-500/10"
                    >
                      Remove Image
                    </button>
                    <label className="px-4 py-2 rounded-xl gradient-accent text-xs text-white font-bold cursor-pointer">
                      Replace Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-16 h-16 rounded-2xl gradient-accent mx-auto flex items-center justify-center shadow-neon">
                    <ImageIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-theme-fg">Drag & Drop Your Poster or Screenshot</h3>
                    <p className="text-xs text-theme-secondary">Supports PNG, JPG, JPEG, WebP (Max 15MB)</p>
                  </div>

                  <div className="flex flex-wrap justify-center gap-3 pt-2">
                    <label className="gradient-accent text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg cursor-pointer flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      <span>Choose from Gallery</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                        className="hidden"
                      />
                    </label>

                    <button
                      onClick={startCamera}
                      className="glass-panel hover:bg-theme-card-hover text-cyan-300 border-cyan-500/30 px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Take a Photo</span>
                    </button>

                    {/* Native mobile camera fallback */}
                    <label className="sm:hidden glass-panel text-theme-fg px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer">
                      <span>Native Camera</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Camera Live View */
            <div className="space-y-4 text-center">
              <div className="relative rounded-2xl overflow-hidden bg-black max-w-xl mx-auto border border-cyan-400">
                <video ref={videoRef} autoPlay playsInline className="w-full h-72 object-cover" />
              </div>
              <div className="flex justify-center gap-3">
                <button
                  onClick={capturePhoto}
                  className="gradient-accent text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-neon flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>Capture Photo</span>
                </button>
                <button
                  onClick={stopCamera}
                  className="glass-panel px-4 py-2.5 rounded-xl text-xs text-theme-secondary font-semibold"
                >
                  Cancel Camera
                </button>
              </div>
            </div>
          )}

          {cameraError && (
            <p className="text-xs text-coral-400 text-center">{cameraError}</p>
          )}

          {/* Extracted Text Editable Area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-theme-fg uppercase tracking-wider">
                Extracted Poster Text (Editable)
              </label>
              {extractedText && (
                <button
                  onClick={handleCopyText}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copyNotice ? 'Copied!' : 'Copy Text'}</span>
                </button>
              )}
            </div>
            <textarea
              rows={5}
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              placeholder="Extracted OCR text will appear here. You can also paste or edit text manually before analysis..."
              className="w-full p-4 rounded-2xl bg-theme-bg border border-theme text-theme-fg text-xs font-mono focus:outline-none focus:border-cyan-400"
            />
          </div>

          {errorMsg && (
            <p className="text-xs text-coral-400 font-medium">{errorMsg}</p>
          )}

          {/* Progress Indicator */}
          {isReadingText && (
            <div className="p-4 rounded-xl glass-panel border-cyan-500/30 text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-cyan-300 font-bold text-xs">
                <Sparkles className="w-4 h-4 animate-spin text-cyan-400" />
                <span>{ocrStatus || 'Reading image text...'}</span>
              </div>
              <div className="w-full bg-theme-bg rounded-full h-2 overflow-hidden">
                <div
                  className="gradient-accent h-full transition-all duration-300"
                  style={{ width: `${Math.round(ocrProgress * 100)}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={handleExtractAndAnalyze}
              disabled={isReadingText}
              className="gradient-accent text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-neon flex items-center gap-2 transition transform active:scale-95 disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              <span>Analyze Poster & Extract Info</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Results Dashboard */}
      {posterResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between border-b border-theme pb-4">
            <h2 className="text-2xl font-black text-theme-fg">Decoded Poster Dashboard</h2>
            <button
              onClick={() => { setPosterResult(null); setSelectedImageUri(null); setExtractedText(''); }}
              className="glass-panel hover:bg-theme-card-hover px-4 py-2 rounded-xl text-xs font-semibold text-cyan-300 flex items-center gap-1.5"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              <span>Analyze Another Image</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Image Preview + Simple Explanation */}
            <div className="space-y-4">
              {posterResult.imageUri && (
                <div className="glass-panel p-3 rounded-2xl border-theme">
                  <img
                    src={posterResult.imageUri}
                    alt={posterResult.title}
                    className="w-full rounded-xl max-h-64 object-cover"
                  />
                </div>
              )}

              <div className="glass-panel p-5 rounded-2xl border-cyan-500/30 space-y-2 bg-cyan-500/5">
                <span className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-wider">
                  1. WHAT IS THIS POSTER ABOUT?
                </span>
                <p className="text-xs text-theme-fg leading-relaxed">
                  {posterResult.simpleExplanation}
                </p>
              </div>

              <div className="glass-panel p-5 rounded-2xl space-y-2">
                <span className="text-[10px] font-extrabold text-brand-300 uppercase tracking-wider">
                  2. MAIN PURPOSE
                </span>
                <p className="text-sm font-bold text-theme-fg">{posterResult.mainPurpose}</p>
              </div>
            </div>

            {/* Middle & Right Column: Highlights & Key Fields */}
            <div className="lg:col-span-2 space-y-5">
              {/* Highlight Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Dates & Deadlines */}
                <div className="glass-panel p-4 rounded-2xl border-coral-500/30 space-y-2">
                  <div className="flex items-center justify-between text-coral-400 font-bold text-xs">
                    <span className="flex items-center gap-1.5 uppercase tracking-wider">
                      <Calendar className="w-4 h-4" />
                      <span>Dates & Time</span>
                    </span>
                    {posterResult.dateTimes.length > 0 && (
                      <button
                        onClick={handleCreateReminderFromPoster}
                        className="p-1 rounded bg-coral-500/20 text-coral-300 text-[10px] font-bold"
                      >
                        + Create Reminder
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-theme-fg font-mono">
                    {posterResult.dateTimes.length > 0 ? posterResult.dateTimes.join(' | ') : 'No date specified'}
                  </p>
                </div>

                {/* Location */}
                <div className="glass-panel p-4 rounded-2xl space-y-2">
                  <div className="text-cyan-400 font-bold text-xs flex items-center gap-1.5 uppercase tracking-wider">
                    <MapPin className="w-4 h-4" />
                    <span>Location / Venue</span>
                  </div>
                  <p className="text-xs text-theme-fg">{posterResult.location}</p>
                </div>

                {/* Audience */}
                <div className="glass-panel p-4 rounded-2xl space-y-2">
                  <div className="text-brand-300 font-bold text-xs flex items-center gap-1.5 uppercase tracking-wider">
                    <UserCheck className="w-4 h-4" />
                    <span>Intended Audience</span>
                  </div>
                  <p className="text-xs text-theme-fg">{posterResult.audience}</p>
                </div>

                {/* Required Action */}
                <div className="glass-panel p-4 rounded-2xl space-y-2">
                  <div className="text-emerald-400 font-bold text-xs flex items-center gap-1.5 uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Required Action</span>
                  </div>
                  <p className="text-xs text-theme-fg">{posterResult.requiredAction}</p>
                </div>
              </div>

              {/* Important Highlights & Contact */}
              <div className="glass-panel p-5 rounded-2xl space-y-3">
                <h3 className="font-bold text-sm text-theme-fg">Key Information Highlights</h3>
                <ul className="space-y-1.5 text-xs text-theme-secondary list-disc pl-4">
                  {posterResult.highlights.map((h, idx) => (
                    <li key={idx}>{h}</li>
                  ))}
                </ul>
              </div>

              {/* Missing Details Alert */}
              {posterResult.missingDetails && posterResult.missingDetails.length > 0 && (
                <div className="glass-panel p-4 rounded-2xl border-amber-500/30 bg-amber-500/5 space-y-1">
                  <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5" /> Missing or Ambiguous Details
                  </span>
                  <p className="text-xs text-theme-secondary">{posterResult.missingDetails.join(' ')}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onAskMissedAboutPoster(posterResult)}
                  className="gradient-accent text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-neon"
                >
                  <Bot className="w-4 h-4" />
                  <span>Ask DECODEIQ About This Poster</span>
                </button>
                <button
                  onClick={() => onSavePosterToVault(posterResult)}
                  className="glass-panel hover:bg-theme-card-hover text-theme-fg px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <Lock className="w-4 h-4 text-cyan-400" />
                  <span>Save to Private Vault</span>
                </button>
                <button
                  onClick={() => onSavePosterToHistory(posterResult)}
                  className="glass-panel hover:bg-theme-card-hover text-theme-fg px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4 text-brand-300" />
                  <span>Save to History</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
