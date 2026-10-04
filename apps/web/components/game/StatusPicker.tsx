'use client'
import { Fragment } from 'react'
import { Listbox, ListboxButton, ListboxOption, ListboxOptions, Transition } from '@headlessui/react'
import { ChevronDownIcon, CheckIcon } from 'lucide-react'
import { clsx } from 'clsx'

const STATUSES = [
  { value: 'PLAYING', label: '▶ Playing' },
  { value: 'COMPLETED', label: '✓ Completed' },
  { value: 'WANT_TO_PLAY', label: '♡ Want to Play' },
  { value: 'DROPPED', label: '✗ Dropped' },
  { value: 'SHELVED', label: '□ Shelved' },
] as const

type StatusValue = typeof STATUSES[number]['value']

interface StatusPickerProps {
  value: StatusValue | null
  onChange: (value: StatusValue) => void
}

export function StatusPicker({ value, onChange }: StatusPickerProps) {
  const selected = STATUSES.find((s) => s.value === value)

  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative">
        <ListboxButton className="flex w-48 items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500">
          <span>{selected?.label ?? 'Add to Library'}</span>
          <ChevronDownIcon className="h-4 w-4" />
        </ListboxButton>
        <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
          <ListboxOptions className="absolute z-10 mt-1 w-48 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
            {STATUSES.map((status) => (
              <ListboxOption
                key={status.value}
                value={status.value}
                className={({ focus }) =>
                  clsx('flex cursor-pointer items-center justify-between px-4 py-2 text-sm', focus ? 'bg-brand-50 text-brand-700' : 'text-gray-700')
                }
              >
                {({ selected }) => (
                  <>
                    <span>{status.label}</span>
                    {selected && <CheckIcon className="h-4 w-4 text-brand-500" />}
                  </>
                )}
              </ListboxOption>
            ))}
          </ListboxOptions>
        </Transition>
      </div>
    </Listbox>
  )
}
