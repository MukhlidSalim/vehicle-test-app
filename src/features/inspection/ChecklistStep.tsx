import React, { useState } from 'react';
import { Camera, AlertTriangle, Eraser, Trash2, Check, X, Images } from 'lucide-react';
import { InspectionData, CheckStatus } from '../../types';
import { 
  GENERIC_CHECKLIST, 
  HEAVY_BUS_CHECKLIST, 
  ELECTRIC_CHECKLIST,
  CHECKLIST_STATUS_LABELS, 
  CHECKLIST_TOOLTIPS, 
  HEAVY_BUS_TOOLTIPS, 
  AMBULANCE_TOOLTIPS,
  ELECTRIC_TOOLTIPS
} from '../../constants';
import { VehicleBodyMap } from '../../components/VehicleBodyMap';
import { compressImage } from '../../utils/imageCompressor';

interface ChecklistStepProps {
  t: any;
  lang: string;
  isRTL: boolean;
  data: InspectionData;
  setData: React.Dispatch<React.SetStateAction<InspectionData>>;
  attemptedStep4: boolean;
}

/**
 * ChecklistStep renders Step 4 of the inspection process: Vehicle Inspection Checklist.
 * Renders 24 checklist items, damage mapping on vehicle silhouette, photo attachments, and notes.
 */
export const ChecklistStep: React.FC<ChecklistStepProps> = ({
  t,
  lang,
  isRTL,
  data,
  setData,
  attemptedStep4,
}) => {
  // Local state for photo selector bottom sheet/modal
  const [photoMenu, setPhotoMenu] = useState<{ isOpen: boolean; itemId: number | null }>({ 
    isOpen: false, 
    itemId: null 
  });

  // Tyre pressure toggle — hidden by default until explicitly opened
  const [showTyrePressure, setShowTyrePressure] = useState(false);

  const vType = data.driverInfo.vehicleType;
  const activeChecklistDef = vType === 'heavy_bus' ? HEAVY_BUS_CHECKLIST : vType === 'electric_vehicle' ? ELECTRIC_CHECKLIST : GENERIC_CHECKLIST;
  const activeTooltips = 
    vType === 'heavy_bus' ? HEAVY_BUS_TOOLTIPS : 
    vType === 'electric_vehicle' ? ELECTRIC_TOOLTIPS :
    vType === 'ambulance' ? AMBULANCE_TOOLTIPS : 
    CHECKLIST_TOOLTIPS;

  // --- Core Checklist Item Actions ---
  const updateItemStatus = (itemId: number, status: CheckStatus) => {
    setData((p) => ({
      ...p,
      checklist: p.checklist.map((item) => item.id === itemId ? { ...item, status } : item)
    }));
  };

  const updateItemNote = (itemId: number, notes: string) => {
    setData((p) => ({
      ...p,
      checklist: p.checklist.map((item) => item.id === itemId ? { ...item, notes } : item)
    }));
  };

  const handlePhotoCapture = async (itemId: number, mode: 'camera' | 'gallery') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';

    if (mode === 'camera') {
      input.setAttribute('capture', 'environment');
    }

    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const compressed = await compressImage(file);
          setData((p) => ({
            ...p,
            checklist: p.checklist.map((item) => {
              if (item.id === itemId) {
                let currentPhotos = item.photos || [];
                if (currentPhotos.length === 0 && item.photo) {
                  currentPhotos = [item.photo];
                }
                if (currentPhotos.length < 3) {
                  return { ...item, photos: [...currentPhotos, compressed], photo: undefined };
                }
                return item;
              }
              return item;
            })
          }));
        } catch (err) {
          console.error('Photo processing error:', err);
        }
      }

      if (document.body.contains(input)) {
        document.body.removeChild(input);
      }
      setPhotoMenu({ isOpen: false, itemId: null });
    };

    input.oncancel = () => {
      if (document.body.contains(input)) {
        document.body.removeChild(input);
      }
      setPhotoMenu({ isOpen: false, itemId: null });
    };

    document.body.appendChild(input);
    input.click();
  };

  const handleRemovePhoto = (itemId: number, indexToRemove: number = 0) => {
    setData((p) => ({
      ...p,
      checklist: p.checklist.map((item) => {
        if (item.id === itemId) {
          let currentPhotos = item.photos || [];
          if (currentPhotos.length === 0 && item.photo) {
            currentPhotos = [item.photo];
          }
          const nextPhotos = currentPhotos.filter((_, idx) => idx !== indexToRemove);
          return { ...item, photos: nextPhotos, photo: undefined };
        }
        return item;
      })
    }));
    setPhotoMenu({ isOpen: false, itemId: null });
  };

  // --- Body Damage Specific Handlers ---
  const handleBodyDamageAdd = (pt: { x: number; y: number }) => {
    const newId = `bd_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    setData((p) => ({
      ...p,
      checklist: p.checklist.map((item) => {
        if (item.key !== 'body_damage') return item;
        const currentPoints = item.damagePoints || [];
        const nextPoints = [...currentPoints, { id: newId, ...pt, note: '' }];
        // Automatically mark status as WARNING if it was PASS or UNCHECKED
        const nextStatus: CheckStatus = (item.status === 'pass' || item.status === 'unchecked') ? 'warning' : item.status;
        return {
          ...item,
          damagePoints: nextPoints,
          status: nextStatus
        };
      })
    }));
  };

  const setBodyDamageStatus = (status: CheckStatus) => {
    setData((p) => ({
      ...p,
      checklist: p.checklist.map((item) => {
        if (item.key !== 'body_damage') return item;
        // If user marks body as PASS, clear recorded damage points for consistency
        if (status === 'pass') return { ...item, status, damagePoints: [] };
        return { ...item, status };
      })
    }));
  };

  const updateBodyDamageNote = (idx: number, note: string) => {
    setData((p) => ({
      ...p,
      checklist: p.checklist.map((item) => {
        if (item.key !== 'body_damage') return item;
        const pts = item.damagePoints || [];
        const next = pts.map((pt, i) => i === idx ? { ...pt, note } : pt);
        return { ...item, damagePoints: next };
      })
    }));
  };

  const removeBodyDamageAt = (idx: number) => {
    setData((p) => ({
      ...p,
      checklist: p.checklist.map((item) => {
        if (item.key !== 'body_damage') return item;
        const pts = item.damagePoints || [];
        const next = pts.filter((_, i) => i !== idx);
        const nextStatus: CheckStatus = next.length > 0 ? 'warning' : 'pass';
        return { ...item, damagePoints: next, status: nextStatus };
      })
    }));
  };

  const handleClearBodyDamage = () => {
    setData((p) => ({
      ...p,
      checklist: p.checklist.map((item) => {
        if (item.key !== 'body_damage') return item;
        return { ...item, damagePoints: [], status: 'pass' };
      })
    }));
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center border-b border-gray-400 pb-3">
         <h2 className="text-lg font-black text-gray-800 flex items-center gap-3 v-center-cairo">
           {t.checklist}
           <span className="text-[11px] font-black text-white bg-primary-600 px-2.5 py-1 rounded-full shadow-sm font-mono">
             {data.checklist.filter((i) => i.status !== 'unchecked').length} / {activeChecklistDef.length}
           </span>
         </h2>
       </div>

       <div className="grid gap-4">
          {/* Loop checklist: Render standard items first, body damage item last */}
          {[
            ...data.checklist.filter((i) => i.key !== 'body_damage'),
            ...data.checklist.filter((i) => i.key === 'body_damage'),
          ].map((item) => {
             const def = activeChecklistDef.find(c => c.key === item.key);
             const isBody = item.key === 'body_damage';
             const isFireExt = item.key === 'fire_ext';
             const isSafetyKit = item.key === 'safety_kit';
             const statusLabels = CHECKLIST_STATUS_LABELS[item.key] || CHECKLIST_STATUS_LABELS['battery'];
             const isWF = item.status === 'warning' || item.status === 'fail';
             const notesMissing = isBody
               ? (isWF && (((item.damagePoints || []).length === 0) || (item.damagePoints || []).some((p) => !p?.note || String(p.note).trim().length === 0)))
               : (isWF && (!item.notes || String(item.notes).trim().length === 0));
             // fire_ext and safety_kit expiry is mandatory whenever the item has been checked (any status except unchecked)
             const expiryMissing = (isFireExt || isSafetyKit) && item.status !== 'unchecked' && !item.expiryDate;
             const needsNotes = attemptedStep4 && notesMissing;
             const needsExpiry = attemptedStep4 && expiryMissing;
             const tooltip = activeTooltips[item.key];
             const isUncheckedError = attemptedStep4 && item.status === 'unchecked';
             
             return (
                <div
                  id={`check-item-${item.key}`}
                  data-error={attemptedStep4 && (isUncheckedError || notesMissing || expiryMissing) ? 'true' : undefined}
                  key={item.key}
                  className={`p-5 rounded-2xl shadow-sm border space-y-5 transition-colors ${
                    isUncheckedError || (attemptedStep4 && (notesMissing || expiryMissing)) 
                      ? 'bg-red-50 border-red-500 shadow-red-50' 
                      : 'bg-white border-gray-400 hover:border-primary-100'
                  }`}
                >
                   {/* Item Header */}
                   <div className="flex items-center gap-4">
                      <div className={`p-1 rounded-xl border shadow-inner ${
                        isUncheckedError ? 'bg-red-100 text-red-600 border-red-200' : 'bg-gray-50 text-primary-600 border-gray-300'
                      }`}>
                        {def && <def.icon size={44} />}
                      </div>
                      <div className="flex items-baseline gap-2 flex-wrap flex-1">
                         <span className="font-bold text-base text-gray-800 v-center-cairo justify-start whitespace-nowrap">
                           {t[item.key as keyof typeof t]}
                         </span>
                         {tooltip && (
                           <span className="text-[10px] text-gray-400 font-medium leading-relaxed">
                             ({isRTL ? tooltip.ar : tooltip.en})
                           </span>
                         )}
                      </div>
                      {isUncheckedError && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-600 text-white rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm animate-bounce">
                          <AlertTriangle size={10} />
                          <span className="v-center-cairo">{isRTL ? 'مطلوب فحصه' : 'Inspection Required'}</span>
                        </div>
                      )}
                      {needsNotes && !isUncheckedError && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-600 text-white rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm animate-pulse border border-red-100 ms-auto">
                          <AlertTriangle size={10} />
                          <span className="v-center-cairo">{isRTL ? 'إلزامية الملاحظات' : 'Notes Required'}</span>
                        </div>
                      )}
                   </div>

                   {/* Actions (Not for Body Damage) */}
                   {!isBody && (
                   <>
                   <div className="grid grid-cols-4 gap-3">
                      <button 
                        onClick={() => updateItemStatus(item.id, 'pass')} 
                        className={`h-[64px] rounded-xl border font-black text-sm v-center-cairo transition-all ${
                          item.status === 'pass' 
                            ? 'bg-green-600 text-white border-green-700 shadow-md' 
                            : 'bg-gray-50 text-gray-400 hover:bg-green-50'
                        } leading-none`}
                      >
                         {statusLabels.pass[lang as keyof typeof statusLabels.pass]}
                      </button>
                      <button 
                        onClick={() => updateItemStatus(item.id, 'warning')} 
                        className={`h-[64px] rounded-xl border font-black text-sm v-center-cairo transition-all ${
                          item.status === 'warning' 
                            ? 'bg-amber-500 text-white border-amber-600 shadow-md' 
                            : 'bg-gray-50 text-gray-400 hover:bg-green-50'
                        } leading-none`}
                      >
                         {t.warning}
                      </button>
                      <button 
                        onClick={() => updateItemStatus(item.id, 'fail')} 
                        className={`h-[64px] rounded-xl border font-black text-sm v-center-cairo transition-all ${
                          item.status === 'fail' 
                            ? 'bg-red-600 text-white border-red-700 shadow-md' 
                            : 'bg-gray-50 text-gray-400 hover:bg-amber-50'
                        } leading-none`}
                      >
                         {statusLabels.fail[lang as keyof typeof statusLabels.fail]}
                      </button>
                      
                      <div className="flex flex-col gap-1.5 h-[64px]">
                          <button 
                            onClick={() => setPhotoMenu({ isOpen: true, itemId: item.id })} 
                            disabled={(item.photos?.length || (item.photo ? 1 : 0)) >= 3}
                            className={`flex-1 rounded-xl border font-black flex flex-col items-center justify-center transition-all ${
                              (item.photos?.length || (item.photo ? 1 : 0)) > 0 ? 'bg-primary-50 text-primary-600 border-primary-200 hover:bg-primary-100' : 'bg-gray-50 text-gray-400 hover:text-primary-500 hover:bg-gray-100'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            <Camera size={20} />
                            <span className="text-[9px] mt-1">{(item.photos?.length || (item.photo ? 1 : 0))}/3</span>
                          </button>
                      </div>
                   </div>

                   {/* Thumbnails Gallery */}
                   {((item.photos && item.photos.length > 0) || item.photo) && (
                     <div className="flex gap-3 mt-4 overflow-x-auto pb-2 no-scrollbar">
                       {(item.photos && item.photos.length > 0 ? item.photos : (item.photo ? [item.photo] : [])).map((img, idx) => (
                         <div key={idx} className="relative w-20 h-20 rounded-xl border border-gray-300 overflow-hidden flex-shrink-0 group shadow-sm">
                           <img src={img} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                           <button
                             type="button"
                             onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRemovePhoto(item.id, idx); }}
                             className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md active:scale-95 transition-all"
                           >
                             <Trash2 size={12} />
                           </button>
                         </div>
                       ))}
                     </div>
                   )}
                   </>
                   )}

                   {/* Body Damage Marking Panel */}
                   {isBody && (
                     <div className="mt-4 p-4 md:p-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 space-y-6">
                       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-1">
                          <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                            {isRTL ? "مخطط هيكل المركبة" : "Vehicle Body Damage Diagram"}
                          </span>
                          <div className="flex items-center gap-2 flex-wrap">
                            {(item.damagePoints && item.damagePoints.length > 0) && (
                              <button
                                type="button"
                                onClick={handleClearBodyDamage}
                                className="flex items-center gap-2 text-red-600 hover:text-red-700 text-[11px] font-black transition-colors px-3 py-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 active:scale-95"
                              >
                                <Eraser size={14} />
                                <span className="v-center-cairo">{t.clear_markers}</span>
                              </button>
                            )}
                          </div>
                       </div>

                       <div className="grid grid-cols-4 gap-3">
                         <button
                           type="button"
                           onClick={() => setBodyDamageStatus('pass')}
                           className={`h-[64px] rounded-xl border font-black text-sm v-center-cairo transition-all ${
                             item.status === 'pass' 
                               ? 'bg-green-600 text-white border-green-700 shadow-md' 
                               : 'bg-gray-50 text-gray-400 hover:bg-green-50'
                           } leading-none`}
                         >
                           {statusLabels.pass[lang as keyof typeof statusLabels.pass]}
                         </button>

                         <button
                           type="button"
                           onClick={() => setBodyDamageStatus('warning')}
                           className={`h-[64px] rounded-xl border font-black text-sm v-center-cairo transition-all ${
                             item.status === 'warning' 
                               ? 'bg-amber-500 text-white border-amber-600 shadow-md' 
                               : 'bg-gray-50 text-gray-400 hover:bg-amber-50'
                           } leading-none`}
                         >
                           {t.warning}
                         </button>

                         <button
                           type="button"
                           onClick={() => setBodyDamageStatus('fail')}
                           className={`h-[64px] rounded-xl border font-black text-sm v-center-cairo transition-all ${
                             item.status === 'fail' 
                               ? 'bg-red-600 text-white border-red-700 shadow-md' 
                               : 'bg-gray-50 text-gray-400 hover:bg-red-50'
                           } leading-none`}
                         >
                           {statusLabels.fail[lang as keyof typeof statusLabels.fail]}
                         </button>

                         <div className="flex flex-col gap-1.5 h-[64px]">
                            <button
                              type="button"
                              onClick={() => setPhotoMenu({ isOpen: true, itemId: item.id })}
                              disabled={(item.photos?.length || (item.photo ? 1 : 0)) >= 3}
                              className={`flex-1 rounded-xl border font-black flex flex-col items-center justify-center transition-all ${
                                (item.photos?.length || (item.photo ? 1 : 0)) > 0 ? 'bg-primary-50 text-primary-600 border-primary-200 hover:bg-primary-100' : 'bg-gray-50 text-gray-400 hover:text-primary-500 hover:bg-gray-100'
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              <Camera size={20} />
                              <span className="text-[9px] mt-1">{(item.photos?.length || (item.photo ? 1 : 0))}/3</span>
                            </button>
                         </div>
                       </div>

                       {/* Thumbnails Gallery for Body Damage */}
                       {((item.photos && item.photos.length > 0) || item.photo) && (
                         <div className="flex gap-3 mb-6 overflow-x-auto pb-2 no-scrollbar">
                           {(item.photos && item.photos.length > 0 ? item.photos : (item.photo ? [item.photo] : [])).map((img, idx) => (
                             <div key={idx} className="relative w-20 h-20 rounded-xl border border-gray-300 overflow-hidden flex-shrink-0 group shadow-sm">
                               <img src={img} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                               <button
                                 type="button"
                                 onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRemovePhoto(item.id, idx); }}
                                 className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md active:scale-95 transition-all"
                               >
                                 <Trash2 size={12} />
                               </button>
                             </div>
                           ))}
                         </div>
                       )}

                       {/* Interactive Silhouette */}
                       <div className="w-full max-w-4xl mx-auto overflow-hidden">
                         <VehicleBodyMap
                           points={item.damagePoints || []}
                           type={data.driverInfo.vehicleType}
                           onAddPoint={handleBodyDamageAdd}
                           isRTL={isRTL}
                         />
                       </div>

                       {/* Description Fields for individual damage marks */}
                       {(item.damagePoints && item.damagePoints.length > 0) && (
                         <div className="bg-white rounded-2xl border border-gray-300 shadow-sm p-4 space-y-3">
                           <div className="flex items-center justify-between">
                             <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                               {isRTL ? 'أوصاف الأضرار' : 'Damage descriptions'}
                             </span>
                             <span className="text-[11px] font-black text-gray-500">
                               {item.damagePoints.length}
                             </span>
                           </div>

                           <div className="space-y-3">
                             {item.damagePoints.map((pt, i) => (
                               <div key={pt.id || i} className="p-3 rounded-2xl border border-gray-300 bg-gray-50">
                                 <div className="flex items-center justify-between gap-3">
                                   <div className="flex items-center gap-2">
                                     <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center text-xs font-black font-mono shadow-sm">
                                       {i + 1}
                                     </div>
                                     <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                       {isRTL ? 'وصف الضرر' : 'Description'}
                                     </span>
                                   </div>
                                   <button
                                     type="button"
                                     onClick={() => removeBodyDamageAt(i)}
                                     className="p-2 rounded-xl border border-red-100 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all active:scale-95"
                                     title={isRTL ? 'حذف الضرر' : 'Delete damage'}
                                   >
                                     <Trash2 size={16} />
                                   </button>
                                 </div>

                                 <textarea
                                   id={`body-damage-note-${pt.id || i}`}
                                   data-error={attemptedStep4 && (!pt.note || String(pt.note).trim().length === 0) ? 'true' : undefined}
                                   value={pt.note || ''}
                                   onChange={(e) => updateBodyDamageNote(i, e.target.value)}
                                   placeholder={isRTL ? 'اكتب وصف الضرر هنا... *' : 'Write the damage description here... *'}
                                   dir={isRTL ? 'rtl' : 'ltr'}
                                   className={`w-full mt-3 p-4 border rounded-2xl bg-white text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-200 resize-none break-words ${
                                     attemptedStep4 && (!pt.note || String(pt.note).trim().length === 0) ? 'border-red-400' : 'border-gray-300'
                                   }`}
                                   style={{ overflowWrap: 'anywhere', wordBreak: 'break-word', whiteSpace: 'normal' }}
                                   rows={3}
                                 />
                               </div>
                             ))}
                           </div>
                         </div>
                       )}
                     </div>
                   )}

                    {/* Fire Extinguisher Expiry Date — always visible for fire_ext, mandatory */}
                    {isFireExt && !isBody && (
                      <div
                        id="fire-ext-expiry"
                        data-error={needsExpiry ? 'true' : undefined}
                        className={`flex flex-col gap-1.5 p-4 rounded-xl border ${
                          needsExpiry ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-gray-50'
                        }`}
                      >
                        <label className={`text-[11px] font-black uppercase tracking-widest ${
                          needsExpiry ? 'text-red-600' : 'text-gray-400'
                        }`}>
                          {isRTL ? 'تاريخ انتهاء صلاحية طفاية الحريق *' : 'Fire Extinguisher Expiry Date *'}
                        </label>
                        <input
                          type="date"
                          value={item.expiryDate || ''}
                          onChange={e => setData(p => ({
                            ...p,
                            checklist: p.checklist.map(ci =>
                              ci.id === item.id ? { ...ci, expiryDate: e.target.value } : ci
                            )
                          }))}
                          className={`w-full p-3 border rounded-xl font-bold text-base outline-none transition-all focus:bg-white ${
                            needsExpiry ? 'border-red-400 bg-red-50 focus:border-red-500' : 'border-gray-300 bg-white focus:border-primary-500'
                          }`}
                        />
                    </div>
                  )}

                  {/* First Aid Kit Expiry Date — same pattern as fire_ext, mandatory */}
                  {isSafetyKit && !isBody && (
                    <div
                      id="safety-kit-expiry"
                      data-error={needsExpiry ? 'true' : undefined}
                      className={`flex flex-col gap-1.5 p-4 rounded-xl border ${
                        needsExpiry ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-gray-50'
                      }`}
                    >
                      <label className={`text-[11px] font-black uppercase tracking-widest ${
                        needsExpiry ? 'text-red-600' : 'text-gray-400'
                      }`}>
                        {isRTL ? 'تاريخ انتهاء صلاحية حقيبة الإسعافات الأولية *' : 'First Aid Kit Expiry Date *'}
                      </label>
                      <input
                        type="date"
                        value={item.expiryDate || ''}
                        onChange={e => setData(p => ({
                          ...p,
                          checklist: p.checklist.map(ci =>
                            ci.id === item.id ? { ...ci, expiryDate: e.target.value } : ci
                          )
                        }))}
                        className={`w-full p-3 border rounded-xl font-bold text-base outline-none transition-all focus:bg-white ${
                          needsExpiry ? 'border-red-400 bg-red-50 focus:border-red-500' : 'border-gray-300 bg-white focus:border-primary-500'
                        }`}
                      />
                    </div>
                  )}

                  {/* Tyre Pressure — hidden by default, toggle to show */}
                  {item.key === 'tyre_pressure' && (
                    <div>
                      {!showTyrePressure ? (
                        <button
                          type="button"
                          onClick={() => setShowTyrePressure(true)}
                          className="w-full p-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 text-xs font-bold text-gray-500 hover:bg-gray-100 hover:border-primary-400 hover:text-primary-600 transition-all flex items-center justify-center gap-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
                          {isRTL ? 'إضافة ضغط الإطارات' : 'Add Tyre Pressure'}
                        </button>
                      ) : (() => {
                        const is6Tyre = ['heavy_bus', 'light_bus', 'ambulance'].includes(vType);
                        const emptyTP = { fl: '', fr: '', rl: '', rr: '', rlo: '', rli: '', rro: '', rri: '' };
                        const tyreFields = is6Tyre
                          ? [
                              { key: 'fl' as const, ar: 'أمامي يسار', en: 'Front Left' },
                              { key: 'fr' as const, ar: 'أمامي يمين', en: 'Front Right' },
                              { key: 'rlo' as const, ar: 'خلفي يسار خارجي', en: 'Rear Left Outer' },
                              { key: 'rli' as const, ar: 'خلفي يسار داخلي', en: 'Rear Left Inner' },
                              { key: 'rro' as const, ar: 'خلفي يمين خارجي', en: 'Rear Right Outer' },
                              { key: 'rri' as const, ar: 'خلفي يمين داخلي', en: 'Rear Right Inner' },
                            ]
                          : [
                              { key: 'fl' as const, ar: 'أمامي يسار', en: 'Front Left' },
                              { key: 'fr' as const, ar: 'أمامي يمين', en: 'Front Right' },
                              { key: 'rl' as const, ar: 'خلفي يسار', en: 'Rear Left' },
                              { key: 'rr' as const, ar: 'خلفي يمين', en: 'Rear Right' },
                            ];

                        return (
                          <div className="p-4 rounded-xl border border-gray-300 bg-gray-50">
                            <div className="flex items-center justify-between mb-3">
                              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                                {isRTL ? `ضغط الإطارات (PSI) — ${is6Tyre ? '6 إطارات' : '4 إطارات'}` : `Tyre Pressure (PSI) — ${is6Tyre ? '6 Tyres' : '4 Tyres'}`}
                              </label>
                              <button
                                type="button"
                                onClick={() => setShowTyrePressure(false)}
                                className="text-[10px] font-bold text-gray-400 hover:text-red-500 transition-colors"
                              >
                                {isRTL ? 'إخفاء' : 'Hide'}
                              </button>
                            </div>
                            <div className={`grid ${is6Tyre ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2'} gap-3`}>
                              {tyreFields.map(tyre => (
                                <div key={tyre.key} className="space-y-1">
                                  <span className="block text-[10px] font-bold text-gray-500">
                                    {isRTL ? tyre.ar : tyre.en}
                                  </span>
                                  <input
                                    type="number"
                                    inputMode="numeric"
                                    placeholder="PSI"
                                    className="w-full p-2.5 text-center text-sm font-black border border-gray-300 rounded-lg bg-white focus:border-primary-500 outline-none transition-all"
                                    value={data.tyrePressures?.[tyre.key] || ''}
                                    onChange={e => setData(p => ({
                                      ...p,
                                      tyrePressures: {
                                        ...(p.tyrePressures || emptyTP),
                                        [tyre.key]: e.target.value.replace(/[^0-9.]/g, '')
                                      }
                                    }))}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Notes Input Field (Visible if Fail/Warning or photo attached, not for body damage itself) */}
                  {(item.status === 'fail' || item.status === 'warning' || item.photo) && !isBody && (
                    <textarea 
                      placeholder={t.notes + (needsNotes ? ' *' : '')} 
                      className={`w-full p-4 border rounded-xl bg-gray-50 text-sm h-24 resize-none font-bold outline-none transition-all focus:bg-white ${
                        needsNotes && (!item.notes || item.notes.trim().length === 0) 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-300 focus:border-primary-500'
                      }`} 
                      value={item.notes} 
                      onChange={e => updateItemNote(item.id, e.target.value)} 
                    />
                  )}
                </div>
             )
          })}
       </div>

        {/* Additional Notes — free-text area after all checklist items */}
        <div className="p-5 rounded-2xl shadow-sm border bg-white border-gray-400 space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary-50 text-primary-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            </div>
            <h3 className="text-sm font-black text-gray-800">
              {isRTL ? 'ملاحظات إضافية (اختياري)' : 'Additional Notes (Optional)'}
            </h3>
          </div>
          <textarea
            placeholder={isRTL ? 'اكتب ملاحظاتك هنا...' : 'Type your notes here...'}
            className="w-full p-4 border border-gray-300 rounded-xl bg-gray-50 text-sm h-28 resize-none font-bold outline-none transition-all focus:bg-white focus:border-primary-500"
            value={data.additionalNotes || ''}
            onChange={e => setData(p => ({ ...p, additionalNotes: e.target.value }))}
          />
        </div>

       {/* Camera / Gallery Selection Bottom Modal */}
       {photoMenu.isOpen && (
         <div 
           className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-4 bg-black/60 backdrop-blur-sm no-print animate-fade-in" 
           onClick={() => setPhotoMenu({ isOpen: false, itemId: null })}
         >
            <div 
              className="bg-white w-full max-w-md rounded-[2.5rem] p-8 space-y-8 animate-scale-in" 
              onClick={e => e.stopPropagation()}
            >
               <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-gray-900 v-center-cairo justify-start">
                      {isRTL ? "إضافة صورة" : "Add Photo"}
                    </h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                      {isRTL ? "اختر طريقة الالتقاط" : "Choose capture method"}
                    </p>
                  </div>
                  <button 
                    onClick={() => setPhotoMenu({ isOpen: false, itemId: null })} 
                    className="p-3 hover:bg-gray-100 rounded-2xl transition-colors"
                  >
                    <X size={24} />
                  </button>
               </div>
               <div className="grid grid-cols-2 gap-6">
                  <button 
                    onClick={() => photoMenu.itemId && handlePhotoCapture(photoMenu.itemId, 'camera')} 
                    className="flex flex-col items-center gap-4 p-8 bg-primary-50 hover:bg-primary-600 group transition-all rounded-[2rem] border-2 border-primary-100"
                  >
                     <div className="p-4 bg-white text-primary-600 rounded-2xl shadow-xl shadow-primary-200 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                       <Camera size={36} strokeWidth={2.5} />
                     </div>
                     <span className="font-black text-primary-900 group-hover:text-white transition-colors v-center-cairo">
                       {isRTL ? "الكاميرا" : "Camera"}
                     </span>
                  </button>
                  <button 
                    onClick={() => photoMenu.itemId && handlePhotoCapture(photoMenu.itemId, 'gallery')} 
                    className="flex flex-col items-center gap-4 p-8 bg-gray-50 hover:bg-primary-600 group transition-all rounded-[2rem] border-2 border-gray-300"
                  >
                     <div className="p-4 bg-white text-primary-600 rounded-2xl shadow-xl shadow-gray-200 group-hover:scale-110 group-hover:-rotate-3 transition-transform">
                       <Images size={36} strokeWidth={2.5} />
                     </div>
                     <span className="font-black text-primary-900 group-hover:text-white transition-colors v-center-cairo">
                       {isRTL ? "المعرض" : "Gallery"}
                     </span>
                  </button>
               </div>
               <button 
                 onClick={() => setPhotoMenu({ isOpen: false, itemId: null })} 
                 className="w-full py-4 text-gray-400 font-black text-sm uppercase tracking-widest hover:text-red-500 transition-colors"
               >
                 {isRTL ? "إلغاء" : "Cancel"}
               </button>
            </div>
         </div>
       )}
    </div>
  );
};
