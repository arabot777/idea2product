"use client"

import { useState, useCallback } from "react"
import { ImageIcon, XCircle, CheckCircle2, AlertCircle } from "lucide-react"
import { useTranslations } from 'next-intl';

import { TaskResultDto } from "@/lib/types/task/task-result.dto";
import { TaskResultStatus, TaskResultType } from "@/lib/types/task/enum.bean";

interface TaskResultCardProps {
  item: TaskResultDto;
}

export function TaskResultCard({ item }: TaskResultCardProps) {
  const t = useTranslations('TaskResultCard');
  const [mediaLoadError, setMediaLoadError] = useState(false);

  const handleMediaError = useCallback(() => {
    setMediaLoadError(true);
  }, []);

  const isSuccess = item.status === TaskResultStatus.COMPLETED;
  const isFailed = item.status === TaskResultStatus.FAILED || item.status === TaskResultStatus.REJECTED || item.status === TaskResultStatus.REJECTED_NSFW;
  const isOtherStatus = !isSuccess && !isFailed; // Other status

  return (
    <div key={item.id} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col">
      {/* Visual content area, using padding-bottom trick to maintain 3:4 aspect ratio */}
      <div className="relative w-full" style={{ paddingBottom: '133.33%' /* 4 / 3 * 100% */ }}>
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Top status icon */}
          {isSuccess && (
            <div className="absolute top-2 left-2 text-green-500 z-10">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          )}
          {isFailed && (
            <div className="absolute top-2 left-2 text-red-500 z-10">
              <XCircle className="w-6 h-6" />
            </div>
          )}
          {isOtherStatus && (
            <div className="absolute top-2 left-2 text-yellow-500 z-10">
              <AlertCircle className="w-6 h-6" />
            </div>
          )}

          <div className="absolute top-0 right-0 text-white z-10 px-2 w-24 text-center py-1 rounded">
            {item.type}
          </div>

          {/* Main content display area (media or error status) */}
          {isFailed || isOtherStatus ? (
            <div className="w-full h-full bg-gray-700 flex flex-col items-center justify-center text-gray-400 text-center p-4">
              {(isFailed || isOtherStatus) && <XCircle className="w-12 h-12 mb-2" />}
              <p className="text-lg font-semibold text-white mb-2">{t('status')}{item.status}</p>
              <p className="text-gray-400 text-sm mt-2">{item.message || t('noMessage')}</p>
            </div>
          ) : mediaLoadError || (!item.storageUrl && item.type !== TaskResultType.TEXT) ? (
            <div className="w-full h-full bg-gray-700 flex flex-col items-center justify-center text-gray-400 text-center p-4">
              <XCircle className="w-12 h-12 mb-2" />
              <p className="mt-2">{t('contentLoadError')}</p>
            </div>
          ) : (
            <>
              {item.type === TaskResultType.IMAGE && item.storageUrl && (
                <img
                  src={item.storageUrl}
                  alt={t('taskResult')}
                  className="w-full h-full object-contain"
                  onError={handleMediaError}
                />
              )}
              {item.type === TaskResultType.VIDEO && item.storageUrl && (
                <video
                  controls
                  src={item.storageUrl}
                  className="w-full h-full object-contain"
                  onError={handleMediaError}
                />
              )}
              {item.type === TaskResultType.AUDIO && item.storageUrl && (
                <audio
                  controls
                  src={item.storageUrl}
                  className="w-full h-full"
                  onError={handleMediaError}
                />
              )}
              {item.type === TaskResultType.TEXT && item.content && (
                <div className="p-4 text-gray-300 text-sm overflow-auto w-full h-full">
                  {item.content}
                </div>
              )}
              {item.type === TaskResultType.THREE_D && (
                <div className="text-white text-xl font-bold w-full h-full flex items-center justify-center">
                  {item.type}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}