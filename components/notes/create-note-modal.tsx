'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Upload, Trash2, Loader2 } from 'lucide-react'
import {
  TemplatePicker,
} from './templates/template-picker'
import type { TemplateType } from './templates/template-preview'
import { TemplatePreview } from './templates/template-preview'
import { uploadFile } from '@/lib/storage'

type CreateNoteModalProps = {
  open: boolean
  onClose: () => void
  onCreate: (
    title: string,
    template: TemplateType,
    templateUrl: string | null,
    coverUrl: string | null
  ) => Promise<void>
}

export function CreateNoteModal({ open, onClose, onCreate }: CreateNoteModalProps) {
  const [title, setTitle] = useState('')
  const [template, setTemplate] = useState<TemplateType>('blank')
  const [templateUrl, setTemplateUrl] = useState<string | null>(null)
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadingTemplate, setUploadingTemplate] = useState(false)
  const [error, setError] = useState('')

  const coverInputRef = useRef<HTMLInputElement>(null)
  const templateInputRef = useRef<HTMLInputElement>(null)

  // Сброс при открытии
  useEffect(() => {
    if (open) {
      setTitle('')
      setTemplate('blank')
      setTemplateUrl(null)
      setCoverUrl(null)
      setLoading(false)
      setUploadingCover(false)
      setUploadingTemplate(false)
      setError('')
    }
  }, [open])

  // Esc
  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingCover(true)
    setError('')

    const url = await uploadFile('covers', file)
    if (url) {
      setCoverUrl(url)
    } else {
      setError('Не удалось загрузить обложку')
    }
    setUploadingCover(false)
    // сбрасываем input, чтобы можно было выбрать ту же картинку повторно
    if (coverInputRef.current) coverInputRef.current.value = ''
  }

  async function handleTemplateUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingTemplate(true)
    setError('')

    const url = await uploadFile('templates', file)
    if (url) {
      setTemplateUrl(url)
      setTemplate('custom')
    } else {
      setError('Не удалось загрузить шаблон')
    }
    setUploadingTemplate(false)
    if (templateInputRef.current) templateInputRef.current.value = ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const trimmed = title.trim() || 'Новая Заметка'

    if (template === 'custom' && !templateUrl) {
      setError('Загрузите свой шаблон или выберите другой')
      return
    }

    setLoading(true)
    await onCreate(trimmed, template, templateUrl, coverUrl)
    setLoading(false)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-xl max-h-[90vh] overflow-y-auto modal-scroll"
     >
        {/* Шапка */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 dark:border-neutral-800">
          <h2 className="text-lg font-semibold text-black dark:text-white">
            Новая заметка
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-500 dark:text-gray-400"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-5">
          {/* Название */}
          <div>
            <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
              Название
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Новая Заметка"
              autoFocus
              className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-950 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
            />
          </div>

          {/* Обложка */}
          <div>
            <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">
              Обложка
            </label>

            <div className="flex items-start gap-3">
              {/* Превью обложки */}
              <div className="w-16 h-20 rounded-md border border-gray-300 dark:border-neutral-700 bg-gray-100 dark:bg-neutral-900 flex items-center justify-center overflow-hidden shrink-0">
                {coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={coverUrl}
                    alt="Обложка"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[10px] text-gray-400 dark:text-gray-600 text-center px-1">
                    Белая
                  </span>
                )}
              </div>

              {/* Кнопки */}
              <div className="flex flex-col gap-2 flex-1">
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverUpload}
                />
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  disabled={uploadingCover}
                  className="flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-50"
                >
                  {uploadingCover ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Загрузка...
                    </>
                  ) : (
                    <>
                      <Upload size={14} />
                      {coverUrl ? 'Заменить' : 'Загрузить'}
                    </>
                  )}
                </button>

                {coverUrl && (
                  <button
                    type="button"
                    onClick={() => setCoverUrl(null)}
                    className="flex items-center justify-center gap-2 px-3 py-1.5 text-xs rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    <Trash2 size={12} />
                    Убрать обложку
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Шаблон */}
          <div>
            <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">
              Шаблон страницы
            </label>

            <TemplatePicker
              value={template}
              onChange={(t) => {
                if (t === 'custom') {
                  // если выбрали свой, но не загружен — открываем диалог
                  if (!templateUrl) {
                    templateInputRef.current?.click()
                    return
                  }
                }
                setTemplate(t)
              }}
            />

            {/* Скрытый input для своего шаблона */}
            <input
              ref={templateInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleTemplateUpload}
            />

            {template === 'custom' && (
              <div className="mt-3 flex items-center gap-3">
                <div className="w-12 h-16 rounded-sm border border-gray-300 dark:border-neutral-700 overflow-hidden bg-white dark:bg-neutral-950 shrink-0">
                  {templateUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={templateUrl}
                      alt="Свой шаблон"
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => templateInputRef.current?.click()}
                    disabled={uploadingTemplate}
                    className="text-xs text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white underline"
                  >
                    {uploadingTemplate ? 'Загрузка...' : templateUrl ? 'Заменить свой шаблон' : 'Выбрать файл'}
                  </button>
                  {templateUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setTemplateUrl(null)
                        setTemplate('blank')
                      }}
                      className="text-xs text-red-600 dark:text-red-400 hover:underline text-left"
                    >
                      Убрать шаблон
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Большое превью */}
          <div>
            <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">
              Превью
            </label>
            <div className="flex justify-center">
              <TemplatePreview
                template={template}
                templateUrl={templateUrl}
                size="lg"
              />
            </div>
          </div>

          {/* Ошибка */}
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          {/* Кнопки */}
          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-md border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm rounded-md bg-black text-white dark:bg-white dark:text-black font-medium hover:opacity-80 disabled:opacity-50"
            >
              {loading ? 'Создаём...' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}