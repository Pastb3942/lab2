import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import {
  Wrench,
  QrCode,
  ClipboardList,
  PlusCircle,
  Smartphone,
  Phone,
  User,
  CheckCircle2,
  Clock,
  ExternalLink,
  Copy,
  Check,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  AlertCircle,
  FileText,
  Printer,
  Sparkles,
  PhoneCall,
  Calendar,
  Layers,
  Image as ImageIcon,
  RefreshCw,
  Database,
  UploadCloud,
  Camera,
  Trash2,
  Link2
} from 'lucide-react';

// ==========================================
// MOCK DATA & CONSTANTS
// ==========================================
const PRESET_PHOTOS = [
  {
    label: 'จอแตก (Cracked Screen)',
    url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'บอดี้มีรอย (Scratched Body)',
    url: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'แบตบวม (Swollen Battery)',
    url: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'น้ำเข้า / คราบน้ำ (Liquid Damage)',
    url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
  },
];

const INITIAL_FALLBACK_JOBS = [
  {
    id: 'FX-001',
    customerName: 'สมชาย พัฒนกุล',
    phone: '081-456-7890',
    deviceModel: 'iPhone 14 Pro (Space Black)',
    issueDescription: 'หน้าจอแตกร้าวจากการตกกระแทก ทัชสกรีนส่วนล่างสะดุด กล้องหน้าใช้งานได้ปกติ',
    photoUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80',
    status: 'repairing',
    createdAt: '23 ก.ย. 2569 - 09:30 น.',
    estimatedCost: '4,200 ฿',
    technicianName: 'ช่างวิทย์ (เสาชิงช้า)',
    notes: 'เปลี่ยนหน้าจอแท้ Grade A พร้อมติดฟิล์มกระจกแถม'
  },
  {
    id: 'FX-002',
    customerName: 'กานต์ดา สุขสวัสดิ์',
    phone: '089-987-6543',
    deviceModel: 'Samsung Galaxy S23 Ultra',
    issueDescription: 'แบตเตอรี่ลดเร็วมาก เครื่องร้อนจัด ฝาหลังเริ่มเผยอ คาดว่าแบตบวม',
    photoUrl: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=600&q=80',
    status: 'received',
    createdAt: '23 ก.ย. 2569 - 11:15 น.',
    estimatedCost: '1,850 ฿',
    technicianName: 'ช่างนพ (ศูนย์ใหญ่)',
    notes: 'รอแกะตรวจเช็คบวมและทำความสะอาดคราบกาว'
  },
  {
    id: 'FX-003',
    customerName: 'ธนากร เมธาพร',
    phone: '095-123-4567',
    deviceModel: 'iPad Air 5 (M1) 64GB Wi-Fi',
    issueDescription: 'ชาร์จไฟไม่เข้า เสียบสายแล้วไม่ขึ้นไอคอนสายฟ้า สภาพขั้ว Type-C มีเศษฝุ่นอุดตัน',
    photoUrl: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=600&q=80',
    status: 'completed',
    createdAt: '22 ก.ย. 2569 - 15:40 น.',
    estimatedCost: '1,200 ฿',
    technicianName: 'ช่างกอล์ฟ (ไมโครโซลเดอร์)',
    notes: 'เปลี่ยนพอร์ตชาร์จ Type-C ใหม่ เทสการชาร์จไฟเข้า 28W ปกติ'
  }
];

const STATUS_CONFIG = {
  received: {
    step: 1,
    title: 'รับเครื่องเรียบร้อย',
    shortLabel: 'รับเครื่องแล้ว',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20',
    dotClass: 'bg-amber-500',
    desc: 'เจ้าหน้าที่บันทึกเข้าระบบ ออกใบรับซ่อม และตรวจสภาพเครื่องเบื้องต้นแล้ว'
  },
  repairing: {
    step: 2,
    title: 'กำลังดำเนินการซ่อม',
    shortLabel: 'กำลังซ่อม',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/20',
    dotClass: 'bg-blue-600 animate-pulse',
    desc: 'ช่างผู้เชี่ยวชาญกำลังตรวจเช็คแผงวงจร หรือทำการเปลี่ยนอะไหล่ที่ได้รับความเสียหาย'
  },
  completed: {
    step: 3,
    title: 'ซ่อมเสร็จแล้ว พร้อมรับเครื่อง',
    shortLabel: 'ซ่อมเสร็จสิ้น',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
    dotClass: 'bg-emerald-600',
    desc: 'ผ่านการทดสอบ QC ครบทุกฟังก์ชันเรียบร้อยแล้ว ลูกค้าสามารถนำใบรับซ่อมมารับเครื่องได้'
  }
};

// Helper: Convert Supabase DB row (snake_case) to Frontend model (camelCase)
const mapRowToJob = (row) => ({
  id: row.id,
  customerName: row.customer_name || row.customerName || 'ไม่ระบุชื่อ',
  phone: row.phone || '',
  deviceModel: row.device_model || row.deviceModel || 'ไม่ระบุรุ่น',
  issueDescription: row.issue_description || row.issueDescription || '',
  photoUrl: row.photo_url || row.photoUrl || PRESET_PHOTOS[0].url,
  status: row.status || 'received',
  createdAt: row.created_at
    ? new Date(row.created_at).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }) + ' น.'
    : (row.createdAt || 'วันนี้'),
  estimatedCost: row.estimated_cost || row.estimatedCost || '1,500 ฿',
  technicianName: row.technician_name || row.technicianName || 'ช่างประจำเวร',
  notes: row.notes || ''
});

// ==========================================
// SUB-COMPONENTS: SHARED UI
// ==========================================
function StatusBadge({ status, size = 'md' }) {
  const conf = STATUS_CONFIG[status] || STATUS_CONFIG.received;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs font-semibold';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ring-1 ${conf.badgeClass} ${sizeClasses}`}>
      <span className={`w-2 h-2 rounded-full ${conf.dotClass}`} />
      <span>{conf.shortLabel}</span>
    </span>
  );
}

// ==========================================
// SCREEN 1: NEW JOB ORDER (หน้าเปิดบิลรับซ่อม)
// ==========================================
function ScreenNewOrder({ onOrderCreated, isSubmitting }) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [photoMode, setPhotoMode] = useState('upload'); // 'upload' | 'url'

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    deviceModel: '',
    issueDescription: '',
    photoUrl: PRESET_PHOTOS[0].url,
    estimatedCost: '1,500 ฿',
    notes: 'ลูกค้าต้องการรีบใช้เครื่อง'
  });

  const [errors, setErrors] = useState({});

  // Process and compress image file
  const handleFileSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น (เช่น JPG, PNG, WEBP)');
      return;
    }

    setIsProcessingImage(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setFormData((prev) => ({ ...prev, photoUrl: compressedDataUrl }));
        setIsProcessingImage(false);
      };
      img.onerror = () => {
        setIsProcessingImage(false);
      };
      img.src = e.target.result;
    };
    reader.onerror = () => {
      setIsProcessingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const validate = () => {
    const err = {};
    if (!formData.customerName.trim()) err.customerName = 'กรุณากรอกชื่อลูกค้า';
    if (!formData.phone.trim()) err.phone = 'กรุณากรอกเบอร์โทรศัพท์';
    if (!formData.deviceModel.trim()) err.deviceModel = 'กรุณาระบุรุ่นอุปกรณ์';
    if (!formData.issueDescription.trim()) err.issueDescription = 'กรุณากรอกอาการเสีย';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;

    const newJob = {
      ...formData,
      id: `FX-${Math.floor(100 + Math.random() * 900)}`,
      status: 'received',
      createdAt: 'วันนี้ - ' + new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.',
      technicianName: 'ช่างประจำเวร (Desk-1)'
    };

    await onOrderCreated(newJob);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                  Screen 1: ฝั่งช่าง
                </span>
                <span className="text-xs text-slate-400">Step 1 of 2</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                เปิดบิลรับเครื่องซ่อมใหม่ (New Job Order)
              </h1>
            </div>
          </div>
          <div className="text-left sm:text-right text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="block font-medium text-slate-700">เลขที่บิลรันอัตโนมัติ</span>
            <span className="font-mono text-blue-600 font-bold">#FX-AutoGenerated</span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Customer Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <User className="w-4 h-4 text-slate-400" />
                ชื่อ-นามสกุล ลูกค้า <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="เช่น ณัฐวุฒิ สมบูรณ์ทรัพย์"
                className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50/50 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition ${
                  errors.customerName ? 'border-rose-400 ring-2 ring-rose-500/10' : 'border-slate-200 focus:border-blue-500'
                }`}
              />
              {errors.customerName && <p className="text-xs text-rose-500 mt-1">{errors.customerName}</p>}
            </div>

            {/* Customer Phone */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-slate-400" />
                เบอร์โทรศัพท์ติดต่อ <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="เช่น 081-234-5678"
                className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50/50 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition ${
                  errors.phone ? 'border-rose-400 ring-2 ring-rose-500/10' : 'border-slate-200 focus:border-blue-500'
                }`}
              />
              {errors.phone && <p className="text-xs text-rose-500 mt-1">{errors.phone}</p>}
            </div>

            {/* Device Model */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-slate-400" />
                ยี่ห้อ / รุ่นอุปกรณ์ <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.deviceModel}
                onChange={(e) => setFormData({ ...formData, deviceModel: e.target.value })}
                placeholder="เช่น iPhone 15 Pro, iPad Air 5, Samsung S24"
                className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50/50 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition ${
                  errors.deviceModel ? 'border-rose-400 ring-2 ring-rose-500/10' : 'border-slate-200 focus:border-blue-500'
                }`}
              />
              {errors.deviceModel && <p className="text-xs text-rose-500 mt-1">{errors.deviceModel}</p>}
            </div>

            {/* Estimated Cost */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-400" />
                ประเมินราคาซ่อมเบื้องต้น
              </label>
              <input
                type="text"
                value={formData.estimatedCost}
                onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                placeholder="เช่น 2,500 ฿ (หรือรอประเมิน)"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* Issue Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-slate-400" />
              อาการเสีย / รายละเอียดปัญหาที่พบ <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={formData.issueDescription}
              onChange={(e) => setFormData({ ...formData, issueDescription: e.target.value })}
              placeholder="เช่น จอแตก ทัชสกรีนไม่ตอบสนองบางจุด มีรอยบุบที่มุมขวาบน หรือเครื่องเปิดไม่ติด ชาร์จไม่เข้า..."
              className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50/50 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition ${
                errors.issueDescription ? 'border-rose-400 ring-2 ring-rose-500/10' : 'border-slate-200 focus:border-blue-500'
              }`}
            />
            {errors.issueDescription && <p className="text-xs text-rose-500 mt-1">{errors.issueDescription}</p>}
          </div>

          {/* Photo Section: Interactive Image Uploader */}
          <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <label className="block text-sm font-bold text-slate-800 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-blue-600" />
                  ภาพถ่ายสภาพเครื่องก่อนซ่อม (Condition Before Repair)
                </label>
                <p className="text-xs text-slate-500 mt-0.5">
                  แนบรูปเพื่อเป็นหลักฐานสภาพตัวเครื่องตอนส่งมอบเข้าระบบ
                </p>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 text-xs font-semibold self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setPhotoMode('upload')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition ${
                    photoMode === 'upload'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>อัปโหลดรูปภาพ</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoMode('url')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition ${
                    photoMode === 'url'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>ใส่ลิงก์ URL</span>
                </button>
              </div>
            </div>

            {/* Hidden native file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />

            {/* UPLOAD MODE */}
            {photoMode === 'upload' && (
              <div>
                {formData.photoUrl ? (
                  /* Image Preview Card with Replace / Remove controls */
                  <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-5">
                    <div className="w-full sm:w-44 h-36 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 relative group">
                      <img
                        src={formData.photoUrl}
                        alt="Uploaded preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-xs text-white font-medium">
                        รูปภาพตัวอย่าง
                      </div>
                    </div>

                    <div className="flex-1 w-full space-y-3 text-center sm:text-left">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>แนบรูปภาพพร้อมใช้งานเรียบร้อย</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        รูปภาพจะถูกบันทึกและแสดงในใบรับซ่อมรวมถึงหน้าติดตามของลูกค้า
                      </p>

                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-blue-200"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>เลือกรูปใหม่ / ถ่ายภาพใหม่</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, photoUrl: '' })}
                          className="px-3 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 border border-slate-200 hover:border-rose-200"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>ลบรูป</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Drag & Drop Upload Zone */
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center group ${
                      isDragging
                        ? 'border-blue-600 bg-blue-50/70 scale-[1.01]'
                        : 'border-slate-300 hover:border-blue-500 bg-white/80 hover:bg-blue-50/30'
                    }`}
                  >
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition shadow-sm border border-blue-100">
                      {isProcessingImage ? (
                        <RefreshCw className="w-7 h-7 animate-spin text-blue-600" />
                      ) : (
                        <UploadCloud className="w-7 h-7" />
                      )}
                    </div>
                    <p className="text-sm font-bold text-slate-800">
                      {isProcessingImage
                        ? 'กำลังประมวลผลรูปภาพ...'
                        : 'คลิกเพื่อเลือกไฟล์รูปภาพ หรือ ลากไฟล์มาวางที่นี่'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      รองรับไฟล์ภาพ JPG, PNG, WEBP หรือถ่ายรูปด้วยกล้องมือถือ
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-sm">
                      <Camera className="w-3.5 h-3.5" />
                      <span>เลือกไฟล์จากเครื่อง</span>
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* URL MODE */}
            {photoMode === 'url' && (
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="flex-1 w-full">
                  <input
                    type="url"
                    value={formData.photoUrl}
                    onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                    placeholder="วางลิงก์รูปภาพ เช่น https://images.unsplash.com/..."
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {formData.photoUrl && (
                  <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-white shadow-md flex-shrink-0 bg-slate-200 relative group">
                    <img
                      src={formData.photoUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = PRESET_PHOTOS[0].url;
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Quick Mockup Preset Chips */}
            <div className="mt-4 pt-3 border-t border-slate-200/60">
              <span className="text-[11px] font-semibold text-slate-500 block mb-2">
                ⚡ หรือคลิกเลือกรูปภาพจำลองอาการเสียด่วน (Quick Presets):
              </span>
              <div className="flex flex-wrap gap-2">
                {PRESET_PHOTOS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData({ ...formData, photoUrl: preset.url })}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition flex items-center gap-1.5 ${
                      formData.photoUrl === preset.url
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>บันทึกลงฐานข้อมูล Supabase และสร้างรหัส QR Code อัตโนมัติ</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full sm:w-auto px-7 py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/30 transition flex items-center justify-center gap-2 ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>กำลังบันทึกลงฐานข้อมูล...</span>
                </>
              ) : (
                <>
                  <span>+ ยืนยันออกใบรับซ่อม</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// SCREEN 2: JOB QR DISPLAY (หน้าแสดง QR Code งานซ่อม)
// ==========================================
function ScreenQrDisplay({ job, onNavigateCustomerView, onNavigateDashboard }) {
  const [copied, setCopied] = useState(false);

  if (!job) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4">
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">ไม่พบข้อมูลใบงาน</h3>
        <p className="text-sm text-slate-500 mb-5">กรุณาเลือกเปิดบิลใหม่ หรือเลือกงานจากแดชบอร์ด</p>
        <button
          onClick={onNavigateDashboard}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm"
        >
          กลับหน้าแดชบอร์ด
        </button>
      </div>
    );
  }

  // Simulated customer tracking URL (can be opened by customer)
  const trackingUrl = `${window.location.origin}/#track=${job.id}`;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(trackingUrl)}&margin=10`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(trackingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Success Badge */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-1.5 rounded-full text-xs font-bold mb-3 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>ออกใบรับซ่อมและบันทึกลงฐานข้อมูลเรียบร้อยแล้ว</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          QR Code ติดตามสถานะงานซ่อม
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          ส่งหรือให้ลูกค้าสแกนเพื่อเช็คขั้นตอนการซ่อมผ่านมือถือได้แบบเรียลไทม์
        </p>
      </div>

      {/* Main Ticket Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-200 relative overflow-hidden">
        {/* Top Accent Strip */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500" />

        <div className="flex flex-col items-center">
          {/* QR Code Container */}
          <div className="p-3 bg-white rounded-2xl border-2 border-dashed border-blue-200 shadow-md mb-4 relative group">
            <img
              src={qrApiUrl}
              alt={`QR Code for ${job.id}`}
              className="w-48 h-48 sm:w-52 sm:h-52 rounded-xl object-contain bg-white"
            />
            <div className="text-center mt-2">
              <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                SCAN WITH MOBILE CAMERA
              </span>
            </div>
          </div>

          {/* Job ID & Status Badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              #{job.id}
            </span>
            <StatusBadge status={job.status} />
          </div>

          <p className="text-xs text-slate-500 text-center max-w-sm mb-6">
            สแกนเพื่อดูความคืบหน้า: <br className="hidden sm:inline" />
            <span className="text-slate-700 font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded break-all">
              {trackingUrl}
            </span>
          </p>

          {/* Job Summary Details Box */}
          <div className="w-full bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-100 text-sm space-y-3 mb-6">
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/60">
              <span className="text-slate-500 text-xs">ลูกค้า:</span>
              <span className="font-bold text-slate-800">{job.customerName} ({job.phone})</span>
            </div>

            <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/60">
              <span className="text-slate-500 text-xs">รุ่นอุปกรณ์:</span>
              <span className="font-semibold text-slate-900">{job.deviceModel}</span>
            </div>

            <div className="flex justify-between items-start pb-2.5 border-b border-slate-200/60">
              <span className="text-slate-500 text-xs flex-shrink-0">อาการเสีย:</span>
              <span className="text-right text-slate-700 text-xs sm:text-sm pl-4 line-clamp-2">
                {job.issueDescription}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">วันที่รับเครื่อง:</span>
              <span className="text-slate-700 font-medium">{job.createdAt}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {/* Copy Link Button */}
            <button
              onClick={handleCopyLink}
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border transition ${
                copied
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-sm'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>คัดลอกลิงก์สำเร็จ!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>คัดลอกลิงก์ติดตาม</span>
                </>
              )}
            </button>

            {/* View Customer Portal */}
            <button
              onClick={() => onNavigateCustomerView(job.id)}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 transition flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>ดูหน้าติดตามของลูกค้า (Screen 3)</span>
            </button>
          </div>

          {/* Secondary Button to Tech Dashboard */}
          <button
            onClick={onNavigateDashboard}
            className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-800 font-medium transition flex items-center justify-center gap-1.5"
          >
            <span>เสร็จสิ้นและไปหน้าแดชบอร์ดช่าง (Screen 4)</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// SCREEN 3: CUSTOMER TRACKING PORTAL (หน้ารายละเอียดและติดตามสถานะงาน)
// ==========================================
function ScreenCustomerTracking({ jobs, selectedJobId, onSelectJob, isDbConnected }) {
  const currentJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];

  if (!currentJob) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <p className="text-slate-500">ไม่พบรายการซ่อม</p>
      </div>
    );
  }

  const currentStep = STATUS_CONFIG[currentJob.status]?.step || 1;

  // Step configs
  const STEPS = [
    {
      num: 1,
      name: 'รับเครื่อง',
      title: '1. ตรวจรับเครื่องแล้ว',
      subtitle: 'บันทึกข้อมูลและภาพถ่ายสภาพเครื่องเข้าระบบ',
      icon: Layers
    },
    {
      num: 2,
      name: 'กำลังซ่อม',
      title: '2. กำลังดำเนินการซ่อม',
      subtitle: 'ช่างกำลังตรวจเช็คและทำการเปลี่ยนอะไหล่',
      icon: Wrench
    },
    {
      num: 3,
      name: 'พร้อมรับคืน',
      title: '3. ซ่อมเสร็จแล้ว พร้อมรับเครื่อง',
      subtitle: 'ผ่านการทดสอบ QC พร้อมส่งมอบอุปกรณ์คืน',
      icon: CheckCircle2
    }
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Customer Mode Badge & Job Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 bg-blue-50/70 border border-blue-200/80 p-4 rounded-2xl">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-white px-2 py-0.5 rounded-full border border-blue-200">
                Screen 3: มุมมองลูกค้า
              </span>
              <span className="text-[11px] text-blue-600 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {isDbConnected ? 'Supabase Real-time' : 'Local State'}
              </span>
            </div>
            <h2 className="text-sm font-bold text-slate-800">
              สถานะงานซ่อม: <span className="font-mono text-blue-700">#{currentJob.id}</span>
            </h2>
          </div>
        </div>

        {/* Quick Dropdown switcher for prototype convenience */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-600 font-medium whitespace-nowrap">
            สลับดูงานอื่น:
          </label>
          <select
            value={currentJob.id}
            onChange={(e) => onSelectJob(e.target.value)}
            className="text-xs font-semibold bg-white border border-blue-300 text-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                #{j.id} - {j.deviceModel} ({STATUS_CONFIG[j.status]?.shortLabel})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Tracking Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 mb-6">
        {/* Device & Status Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
          <div>
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              REPAIR TICKET #{currentJob.id}
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {currentJob.deviceModel}
            </h1>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>เปิดใบงานเมื่อ {currentJob.createdAt}</span>
            </p>
          </div>
          <div>
            <StatusBadge status={currentJob.status} size="lg" />
          </div>
        </div>

        {/* ================= STEPPER / PROGRESS BAR ================= */}
        <div className="py-8">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">
            ความคืบหน้าการซ่อม (Repair Progress)
          </h3>

          {/* Stepper Bar Container */}
          <div className="relative">
            {/* Background line */}
            <div className="absolute top-6 left-6 right-6 h-1.5 bg-slate-100 -translate-y-1/2 z-0 hidden sm:block" />

            {/* Active filled line */}
            <div
              className="absolute top-6 left-6 h-1.5 bg-blue-600 -translate-y-1/2 z-0 transition-all duration-500 ease-out hidden sm:block"
              style={{
                width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : 'calc(100% - 3rem)'
              }}
            />

            {/* Stepper Nodes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-2 relative z-10">
              {STEPS.map((s) => {
                const isPassed = currentStep > s.num;
                const isCurrent = currentStep === s.num;
                const IconComponent = s.icon;

                return (
                  <div key={s.num} className="flex sm:flex-col items-center sm:text-center gap-4 sm:gap-2">
                    {/* Circle Node */}
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm transition-all duration-300 flex-shrink-0 ${
                        isPassed
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                          : isCurrent
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/35 ring-4 ring-blue-100 scale-105'
                          : 'bg-white border-2 border-slate-200 text-slate-400'
                      }`}
                    >
                      {isPassed ? (
                        <Check className="w-5 h-5 text-white stroke-[3]" />
                      ) : (
                        <IconComponent className="w-5 h-5" />
                      )}
                    </div>

                    {/* Step Text */}
                    <div className="text-left sm:text-center">
                      <div className="flex items-center gap-1.5 sm:justify-center">
                        <span
                          className={`text-xs font-bold ${
                            isCurrent
                              ? 'text-blue-600'
                              : isPassed
                              ? 'text-slate-800'
                              : 'text-slate-400'
                          }`}
                        >
                          {s.title}
                        </span>
                        {isCurrent && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping inline-block" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        {s.subtitle}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current Step Highlight Banner */}
          <div className="mt-8 bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-800">
                สถานะปัจจุบัน: {STATUS_CONFIG[currentJob.status]?.title}
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                {STATUS_CONFIG[currentJob.status]?.desc}
              </p>
            </div>
          </div>
        </div>

        {/* ================= DETAILS & BEFORE REPAIR PHOTO ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
          {/* Left: Device & Issue Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              ข้อมูลรายละเอียดการซ่อม
            </h3>

            <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100 space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">ชื่อเจ้าของเครื่อง:</span>
                <span className="font-bold text-slate-800 text-sm">{currentJob.customerName}</span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">เบอร์โทรติดต่อ:</span>
                <span className="font-semibold text-slate-800">{currentJob.phone}</span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">อาการเสียที่แจ้งไว้:</span>
                <p className="text-slate-700 mt-0.5 font-medium leading-relaxed bg-white p-2.5 rounded-xl border border-slate-200/80">
                  {currentJob.issueDescription}
                </p>
              </div>

              {currentJob.notes && (
                <div>
                  <span className="text-slate-400 block font-medium">หมายเหตุจากช่าง:</span>
                  <span className="text-blue-700 font-medium">{currentJob.notes}</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200/60 flex justify-between items-center">
                <span className="text-slate-500">ประมาณการค่าใช้จ่าย:</span>
                <span className="text-sm font-extrabold text-slate-900">{currentJob.estimatedCost}</span>
              </div>
            </div>
          </div>

          {/* Right: Condition Photo Before Repair */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>ภาพถ่ายสภาพเครื่องตอนรับงาน</span>
              <span className="text-[11px] text-blue-600 font-medium">Inspection Photo</span>
            </h3>

            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 relative group aspect-[4/3]">
              <img
                src={currentJob.photoUrl}
                alt="Device condition before repair"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 text-white">
                <span className="text-[11px] font-medium block">
                  สภาพเครื่องบันทึกเมื่อแรกรับ #{currentJob.id}
                </span>
                <span className="text-[10px] text-slate-300">
                  ช่างผู้รับเรื่อง: {currentJob.technicianName}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Help Footer */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            หากมีข้อสงสัยเพิ่มเติม สามารถติดต่อร้านได้โดยตรง แจ้งรหัส <strong className="text-slate-800">#{currentJob.id}</strong>
          </div>
          <a
            href="tel:021234567"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>โทรสอบถามช่าง (02-123-4567)</span>
          </a>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// SCREEN 4: TECHNICIAN DASHBOARD (หน้าแดชบอร์ดช่าง)
// ==========================================
function ScreenTechDashboard({ jobs, onStatusChange, onViewQr, onTrackJob, onNewOrderClick, isDbConnected, onRefresh, isLoading }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Stats calculation
  const totalCount = jobs.length;
  const receivedCount = jobs.filter((j) => j.status === 'received').length;
  const repairingCount = jobs.filter((j) => j.status === 'repairing').length;
  const completedCount = jobs.filter((j) => j.status === 'completed').length;

  // Filtered jobs
  const filteredJobs = jobs.filter((j) => {
    const matchesStatus = filterStatus === 'all' || j.status === filterStatus;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      j.id.toLowerCase().includes(q) ||
      j.customerName.toLowerCase().includes(q) ||
      j.deviceModel.toLowerCase().includes(q) ||
      j.phone.includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
              Screen 4: ฝั่งช่าง
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 ${
              isDbConnected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              <Database className="w-3 h-3" />
              <span>{isDbConnected ? 'Supabase Connected' : 'Local Fallback'}</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            แดชบอร์ดจัดการงานซ่อม (Technician Dashboard)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            จัดการสถานะงานซ่อมแบบเรียลไทม์ และออก QR Code สำหรับส่งมอบให้ลูกค้า
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-3 bg-white hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 shadow-sm transition active:scale-95"
            title="รีเฟรชข้อมูลจาก Supabase"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          <button
            onClick={onNewOrderClick}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ เปิดบิลรับซ่อมใหม่</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {/* Total */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">งานซ่อมทั้งหมด</span>
            <ClipboardList className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{totalCount}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">รายการในระบบ</span>
        </div>

        {/* Received */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-sm bg-gradient-to-br from-white to-amber-50/30">
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-xs font-semibold">รับเครื่องแล้ว</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-700">{receivedCount}</div>
          <span className="text-[11px] text-amber-600/80 mt-1 block">รอตรวจเช็ค/เริ่มซ่อม</span>
        </div>

        {/* Repairing */}
        <div className="bg-white p-5 rounded-2xl border border-blue-200/80 shadow-sm bg-gradient-to-br from-white to-blue-50/30">
          <div className="flex items-center justify-between text-blue-700 mb-2">
            <span className="text-xs font-semibold">กำลังซ่อม</span>
            <Wrench className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-700">{repairingCount}</div>
          <span className="text-[11px] text-blue-600/80 mt-1 block">อยู่ระหว่างดำเนินการ</span>
        </div>

        {/* Completed */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-200/80 shadow-sm bg-gradient-to-br from-white to-emerald-50/30">
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <span className="text-xs font-semibold">ซ่อมเสร็จสิ้น</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700">{completedCount}</div>
          <span className="text-[11px] text-emerald-600/80 mt-1 block">พร้อมให้ลูกค้ารับคืน</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center overflow-x-auto gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          {[
            { id: 'all', label: `ทั้งหมด (${totalCount})` },
            { id: 'received', label: `รับเครื่อง (${receivedCount})` },
            { id: 'repairing', label: `กำลังซ่อม (${repairingCount})` },
            { id: 'completed', label: `เสร็จแล้ว (${completedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                filterStatus === tab.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาตามรหัสบิล, ชื่อลูกค้า, รุ่นมือถือ หรือเบอร์โทร..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Job Cards Grid */}
      {filteredJobs.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300">
          <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">ไม่พบรายการงานซ่อมที่ตรงกับเงื่อนไข</h3>
          <p className="text-xs text-slate-400 mt-1">ลองเปลี่ยนคำค้นหา หรือคลิกปุ่มเปิดบิลใหม่</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between"
            >
              {/* Card Top: ID, Status & Date */}
              <div>
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-base text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                      #{job.id}
                    </span>
                    <span className="text-[11px] text-slate-400">{job.createdAt}</span>
                  </div>
                  <StatusBadge status={job.status} size="sm" />
                </div>

                {/* Device & Condition Image Thumbnail */}
                <div className="flex gap-3 mb-3">
                  <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 relative group">
                    <img
                      src={job.photoUrl}
                      alt={job.deviceModel}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      {job.deviceModel}
                    </h3>
                    <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                      <User className="w-3 h-3 text-slate-400" />
                      <span className="truncate">{job.customerName}</span>
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{job.phone}</span>
                    </p>
                  </div>
                </div>

                {/* Issue Description */}
                <div className="bg-slate-50 rounded-xl p-2.5 text-xs text-slate-700 mb-4 border border-slate-100">
                  <span className="font-semibold text-slate-900 block mb-0.5">อาการเสีย:</span>
                  <p className="line-clamp-2 leading-relaxed text-slate-600">
                    {job.issueDescription}
                  </p>
                </div>
              </div>

              {/* Status Changer Buttons (Quick Action) */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    เปลี่ยนสถานะงานซ่อม:
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { key: 'received', label: '1. รับเครื่อง' },
                      { key: 'repairing', label: '2. กำลังซ่อม' },
                      { key: 'completed', label: '3. เสร็จแล้ว' }
                    ].map((st) => (
                      <button
                        key={st.key}
                        onClick={() => onStatusChange(job.id, st.key)}
                        className={`text-[11px] font-semibold py-1.5 px-1 rounded-lg border transition ${
                          job.status === st.key
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Card Action Links */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => onViewQr(job.id)}
                    className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <QrCode className="w-3.5 h-3.5 text-blue-600" />
                    <span>ดู QR Code</span>
                  </button>

                  <button
                    onClick={() => onTrackJob(job.id)}
                    className="flex-1 py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>มุมมองลูกค้า</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==========================================
// MAIN APP COMPONENT (Single File State & Navigation)
// ==========================================
export default function App() {
  // Central State Management
  const [jobs, setJobs] = useState(INITIAL_FALLBACK_JOBS);
  const [currentScreen, setCurrentScreen] = useState('tech-dashboard'); // 'new-order' | 'qr-display' | 'customer-tracking' | 'tech-dashboard'
  const [activeJobId, setActiveJobId] = useState(INITIAL_FALLBACK_JOBS[0].id);
  const [toastMessage, setToastMessage] = useState(null);
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dbSetupNeeded, setDbSetupNeeded] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Fetch jobs from Supabase
  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // Table not created or permission error
        console.warn('Supabase fetch notice:', error.message);
        setDbSetupNeeded(true);
        setIsDbConnected(false);
      } else if (data && data.length > 0) {
        const mapped = data.map(mapRowToJob);
        setJobs(mapped);
        setIsDbConnected(true);
        setDbSetupNeeded(false);
      } else if (data && data.length === 0) {
        // Table exists but is empty
        setIsDbConnected(true);
        setDbSetupNeeded(false);
      }
    } catch (err) {
      console.error('Supabase connection error:', err);
      setIsDbConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Initial load & Supabase Realtime subscription
  useEffect(() => {
    fetchJobs();

    // Check URL hash for direct tracking e.g. #track=FX-001
    const checkHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#track=')) {
        const id = hash.replace('#track=', '');
        if (id) {
          setActiveJobId(id);
          setCurrentScreen('customer-tracking');
        }
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);

    // Subscribe to real-time changes
    const channel = supabase
      .channel('public:jobs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, () => {
        fetchJobs();
      })
      .subscribe();

    return () => {
      window.removeEventListener('hashchange', checkHash);
      supabase.removeChannel(channel);
    };
  }, []);

  // 3. Handler: When a new repair order is created
  const handleOrderCreated = async (newJob) => {
    setIsSubmitting(true);
    // Optimistic UI update
    setJobs((prev) => [newJob, ...prev]);
    setActiveJobId(newJob.id);
    setCurrentScreen('qr-display');

    try {
      const { error } = await supabase.from('jobs').insert([
        {
          id: newJob.id,
          customer_name: newJob.customerName,
          phone: newJob.phone,
          device_model: newJob.deviceModel,
          issue_description: newJob.issueDescription,
          photo_url: newJob.photoUrl,
          status: newJob.status,
          estimated_cost: newJob.estimatedCost,
          technician_name: newJob.technicianName,
          notes: newJob.notes
        }
      ]);

      if (error) {
        console.warn('Could not insert to Supabase, saved locally:', error.message);
        showToast(`ออกใบรับซ่อมสำเร็จ #${newJob.id} (บันทึกใน Local State)`);
      } else {
        showToast(`ออกใบรับซ่อมและบันทึกลง Supabase สำเร็จ #${newJob.id}`);
        fetchJobs();
      }
    } catch (err) {
      console.error(err);
      showToast(`ออกใบรับซ่อมสำเร็จ #${newJob.id}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Handler: When status is changed by technician
  const handleStatusChange = async (jobId, newStatus) => {
    // Optimistic UI update
    setJobs((prevJobs) =>
      prevJobs.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j))
    );

    const label = STATUS_CONFIG[newStatus]?.shortLabel || newStatus;
    showToast(`อัปเดตสถานะ #${jobId} เป็น "${label}" เรียบร้อยแล้ว`);

    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status: newStatus })
        .eq('id', jobId);

      if (error) {
        console.warn('Supabase update warning:', error.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handlers for navigation
  const handleViewQr = (jobId) => {
    setActiveJobId(jobId);
    setCurrentScreen('qr-display');
  };

  const handleNavigateCustomer = (jobId) => {
    if (jobId) setActiveJobId(jobId);
    setCurrentScreen('customer-tracking');
  };

  const activeJob = jobs.find((j) => j.id === activeJobId) || jobs[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-['Prompt',sans-serif]">
      {/* ========================================== */}
      {/* SUPABASE SETUP NOTICE (IF TABLE NOT YET CREATED) */}
      {/* ========================================== */}
      {dbSetupNeeded && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 max-w-5xl mx-auto w-full">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-slate-950" />
            <span>
              <strong>แจ้งเตือน:</strong> โปรเจกต์เชื่อมต่อกับ Supabase แล้ว แต่ยังไม่ได้สร้างตาราง <code className="bg-amber-600/30 px-1 py-0.5 rounded font-mono">jobs</code> ใน Supabase (ระบบกำลังทำงานด้วย Local Mockup ชั่วคราว)
            </span>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TOP NAVIGATION BAR */}
      {/* ========================================== */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div
            onClick={() => setCurrentScreen('tech-dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-600/25 group-hover:scale-105 transition">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                  QuickFix <span className="text-blue-600">Track</span>
                </span>
                <span className={`hidden sm:inline-block text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  isDbConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-700'
                }`}>
                  {isDbConnected ? 'SUPABASE LIVE' : 'PROTOTYPE'}
                </span>
              </div>
              <span className="hidden sm:block text-[11px] text-slate-400 -mt-1 font-medium">
                ระบบออกใบรับงานซ่อมและติดตามผ่าน QR Code
              </span>
            </div>
          </div>

          {/* Navigation Tabs (Technician & Customer Modes) */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {/* Technician Side Group */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              {/* Screen 1: New Job Order */}
              <button
                onClick={() => setCurrentScreen('new-order')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  currentScreen === 'new-order'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span className="hidden md:inline">เปิดบิลใหม่</span>
                <span className="md:hidden">เปิดบิล</span>
              </button>

              {/* Screen 4: Technician Dashboard */}
              <button
                onClick={() => setCurrentScreen('tech-dashboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  currentScreen === 'tech-dashboard'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span className="hidden md:inline">แดชบอร์ดงานซ่อม</span>
                <span className="md:hidden">แดชบอร์ด</span>
              </button>
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            {/* Customer Side Group */}
            <button
              onClick={() => setCurrentScreen('customer-tracking')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
                currentScreen === 'customer-tracking'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                  : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50/50'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">หน้ารายละเอียด & สถานะ (ลูกค้า)</span>
              <span className="sm:hidden">ติดตามงาน</span>
            </button>
          </nav>
        </div>
      </header>

      {/* ========================================== */}
      {/* TOAST NOTIFICATION */}
      {/* ========================================== */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 backdrop-blur text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-fade-in border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================== */}
      {/* MAIN SCREEN ROUTER */}
      {/* ========================================== */}
      <main className="flex-1 pb-16">
        {currentScreen === 'new-order' && (
          <ScreenNewOrder onOrderCreated={handleOrderCreated} isSubmitting={isSubmitting} />
        )}

        {currentScreen === 'qr-display' && (
          <ScreenQrDisplay
            job={activeJob}
            onNavigateCustomerView={handleNavigateCustomer}
            onNavigateDashboard={() => setCurrentScreen('tech-dashboard')}
          />
        )}

        {currentScreen === 'customer-tracking' && (
          <ScreenCustomerTracking
            jobs={jobs}
            selectedJobId={activeJobId}
            onSelectJob={(id) => setActiveJobId(id)}
            isDbConnected={isDbConnected}
          />
        )}

        {currentScreen === 'tech-dashboard' && (
          <ScreenTechDashboard
            jobs={jobs}
            onStatusChange={handleStatusChange}
            onViewQr={handleViewQr}
            onTrackJob={handleNavigateCustomer}
            onNewOrderClick={() => setCurrentScreen('new-order')}
            isDbConnected={isDbConnected}
            onRefresh={fetchJobs}
            isLoading={isLoading}
          />
        )}
      </main>

      {/* ========================================== */}
      {/* FOOTER */}
      {/* ========================================== */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">QuickFix Track System</span>
            <span>•</span>
            <span>React SPA + Supabase Database</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isDbConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            <span>สถานะระบบ: <strong>{isDbConnected ? 'เชื่อมต่อ Supabase Real-time แล้ว' : 'ใช้ In-memory State'}</strong> ({jobs.length} ใบงาน)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
