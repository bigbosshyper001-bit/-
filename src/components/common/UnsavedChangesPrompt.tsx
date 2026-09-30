import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Modal } from '../ui/Modal.tsx';
import { Button } from '../ui/Button.tsx';

export interface UnsavedChangesPromptProps {
  isOpen: boolean;
  onStay: () => void;
  onLeave: () => void;
  title?: string;
  message?: string;
}

export const UnsavedChangesPrompt: React.FC<UnsavedChangesPromptProps> = ({
  isOpen,
  onStay,
  onLeave,
  title = 'มีข้อมูลที่ยังไม่ได้บันทึก',
  message = 'ต้องการออกจากหน้านี้หรือไม่? ข้อมูลที่คุณกรอกไว้จะสูญหายหากไม่ได้กดบันทึก',
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onStay} title="" size="sm">
      <div className="p-2 text-center">
        <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{message}</p>

        <div className="mt-6 flex items-center justify-center gap-3 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={onStay}
            className="text-xs font-semibold"
          >
            อยู่ต่อ
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={onLeave}
            className="text-xs font-semibold"
          >
            ออกโดยไม่บันทึก
          </Button>
        </div>
      </div>
    </Modal>
  );
};
