import React, { useState } from 'react';
import { AlertTriangle, Trash2, X, AlertCircle } from 'lucide-react';
import { Modal } from '../ui/Modal.tsx';
import { Button } from '../ui/Button.tsx';

export interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => Promise<void> | void;
  title?: string;
  itemName?: string;
  itemCode?: string;
  isPermanent?: boolean;
  isLoading?: boolean;
  requireReason?: boolean;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  itemCode,
  isPermanent = false,
  isLoading = false,
  requireReason = false,
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    if (requireReason && !reason.trim()) {
      setError('กรุณาระบุเหตุผลในการลบข้อมูล');
      return;
    }
    setError('');
    await onConfirm(reason);
  };

  const modalTitle = title || (isPermanent ? 'ลบข้อมูลถาวรหรือไม่?' : 'ลบข้อมูลหรือไม่?');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="md">
      <div className="p-1">
        {/* Warning Icon & Header */}
        <div className="flex items-start gap-3.5">
          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
              isPermanent ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-700'
            }`}
          >
            {isPermanent ? (
              <Trash2 className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {modalTitle}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
              {isPermanent ? (
                <>
                  คุณกำลังจะลบข้อมูลนี้อย่างถาวรออกจากฐานข้อมูล Cloud Database{' '}
                  <strong className="text-rose-600 font-semibold">
                    ข้อมูลนี้จะไม่สามารถกู้คืนได้อีก
                  </strong>
                </>
              ) : (
                <>
                  คุณกำลังจะลบข้อมูลรายการนี้ การดำเนินการนี้จะย้ายข้อมูลไปยัง{' '}
                  <strong className="text-slate-800 font-semibold">"ถังขยะ (Recycle Bin)"</strong>{' '}
                  และสามารถกู้คืนได้ในภายหลัง
                </>
              )}
            </p>
          </div>
        </div>

        {/* Item Summary Card */}
        {(itemName || itemCode) && (
          <div className="mt-4 p-3 bg-slate-50 border border-slate-200/90 rounded-xl text-xs">
            <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
              รายการที่เลือกลบ
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              {itemCode && (
                <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {itemCode}
                </span>
              )}
              <span className="font-semibold text-slate-900 line-clamp-2">
                {itemName}
              </span>
            </div>
          </div>
        )}

        {/* Reason Input (Optional/Required) */}
        {requireReason && (
          <div className="mt-3.5">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              เหตุผลในการลบ <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              placeholder="ระบุเหตุผล เช่น ข้อมูลซ้ำซ้อน, กรอกผิดพลาด..."
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
            {error && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{error}</span>
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="text-xs"
          >
            ยกเลิก
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleConfirm}
            isLoading={isLoading}
            disabled={isLoading}
            className={`text-xs flex items-center gap-1.5 ${
              isPermanent ? 'bg-rose-700 hover:bg-rose-800 text-white' : ''
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isPermanent ? 'ลบถาวร' : 'ลบข้อมูล'}</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
};
