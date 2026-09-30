import React, { type ErrorInfo, type ReactNode } from 'react';
import { ShieldAlert, RefreshCw, Home, PhoneCall } from 'lucide-react';
import { errorService } from '../../services/errorService.ts';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorTitle: string;
  errorMessage: string;
  actionableHint: string;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorTitle: '',
      errorMessage: '',
      actionableHint: '',
    };
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const formatted = errorService.formatUserErrorMessage(error);
    return {
      hasError: true,
      errorTitle: formatted.title,
      errorMessage: formatted.message,
      actionableHint: formatted.actionableHint,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // In production, log to telemetry without exposing stack trace to DOM
    console.error('Institutional Error Boundary caught error:', error.message, errorInfo.componentStack);
  }

  private handleReset = () => {
    this.setState({ hasError: false, errorTitle: '', errorMessage: '', actionableHint: '' });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, errorTitle: '', errorMessage: '', actionableHint: '' });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[500px] flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-rose-50 rounded-2xl border border-rose-200 text-[#D94F87] flex items-center justify-center mx-auto mb-5 shadow-sm">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 mb-3">
              ระบบความปลอดภัยและความเสถียรภาพ กองวิชาการ มจร
            </span>

            <h2 className="text-xl font-bold text-slate-900 mb-2">
              {this.state.errorTitle || 'เกิดข้อขัดข้องชั่วคราวในการแสดงผล'}
            </h2>

            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              {this.state.errorMessage || 'ระบบได้ทำการปกป้องความสมบูรณ์ของข้อมูลและหยุดการทำงานที่ผิดพลาด'}
            </p>

            {this.state.actionableHint && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-800 text-left mb-6 flex items-start gap-2.5">
                <span className="font-semibold shrink-0">คำแนะนำ:</span>
                <span>{this.state.actionableHint}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#D94F87] hover:bg-[#c23e75] text-white rounded-xl text-sm font-medium transition-colors shadow-sm cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                ลองใหม่อีกครั้ง
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors cursor-pointer"
              >
                <Home className="w-4 h-4" />
                กลับหน้าหลัก
              </button>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-center gap-2">
              <PhoneCall className="w-3.5 h-3.5" />
              <span>ติดต่อฝ่ายเทคโนโลยีสารสนเทศ กองวิชาการ โทร. 035-248-000 ต่อ 8100</span>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
