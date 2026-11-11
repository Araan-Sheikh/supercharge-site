'use client';

import { useState } from 'react';

const PRESETS = [100, 500, 1000, 2500];

export function DonateForm() {
  const [amount, setAmount] = useState('500');

  return (
    <form action="/api/donate" method="post" className="mt-8 space-y-5">
      <fieldset>
        <legend className="text-sm text-zinc-400">Amount</legend>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {PRESETS.map((value) => {
            const selected = amount === String(value);
            return (
              <button
                key={value}
                type="button"
                aria-pressed={selected}
                onClick={() => setAmount(String(value))}
                className={`rounded-xl border px-2 py-2.5 text-sm font-medium transition-colors ${
                  selected
                    ? 'border-orange-500 bg-orange-500 text-black'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-600'
                }`}
              >
                ₹{value}
              </button>
            );
          })}
        </div>
        <label className="mt-3 block">
          <span className="sr-only">Amount in INR</span>
          <span className="flex items-center rounded-xl border border-zinc-800 bg-zinc-950 px-3 focus-within:border-orange-500">
            <span className="text-zinc-500">₹</span>
            <input
              name="amount"
              type="number"
              min={1}
              max={100000}
              step="1"
              required
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="w-full bg-transparent px-2 py-3 text-lg outline-none"
            />
          </span>
        </label>
      </fieldset>
      <label className="block text-sm text-zinc-400">
        Name
        <input
          name="firstname"
          required
          autoComplete="name"
          className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-3 text-zinc-100 outline-none focus:border-orange-500"
        />
      </label>
      <label className="block text-sm text-zinc-400">
        Email
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-3 text-zinc-100 outline-none focus:border-orange-500"
        />
      </label>
      <label className="block text-sm text-zinc-400">
        Phone
        <span className="ml-2 text-zinc-600">optional</span>
        <input
          name="phone"
          inputMode="numeric"
          autoComplete="tel"
          className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-3 text-zinc-100 outline-none focus:border-orange-500"
        />
      </label>
      <button
        type="submit"
        className="w-full rounded-md bg-orange-500 py-3 font-semibold text-black transition-colors hover:bg-orange-400"
      >
        Continue to PayU
      </button>
    </form>
  );
}
