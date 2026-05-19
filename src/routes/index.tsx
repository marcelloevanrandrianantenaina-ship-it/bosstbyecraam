import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Clock3,
  Menu,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Zap,
  Flame,
} from "lucide-react";

import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();

      const h = String(now.getHours()).padStart(2, "0");
      const m = String(now.getMinutes()).padStart(2, "0");
      const s = String(now.getSeconds()).padStart(2, "0");

      setTime(`${h}:${m}:${s}`);
    };

    update();

    const i = setInterval(update, 1000);

    return () => clearInterval(i);
  }, []);

  return (
    <div className="min-h-screen bg-[#070b14] text-white">

      {/* HEADER */}

      <header className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-xl bg-black/30">

        <div className="flex items-center justify-between px-4 py-4">

          <div className="flex items-center gap-3">

            <div className="h-12 w-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center border border-cyan-400/20">

              <Zap className="h-6 w-6 text-cyan-400" />

            </div>

            <div>

              <h1 className="text-xl font-black">
                Boost-by Ecr_aaM
              </h1>

              <p className="text-xs text-gray-400">
                Boost premium Madagascar
              </p>

            </div>

          </div>

          <button className="h-12 w-12 rounded-2xl bg-cyan-400 text-black flex items-center justify-center">

            <Menu className="h-6 w-6" />

          </button>

        </div>

        <div className="px-4 pb-4 flex items-center gap-3">

          <div className="flex-1 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-3">

            <div className="text-xs text-gray-400">
              Solde
            </div>

            <div className="mt-1 text-lg font-black text-cyan-400">
              0 Ar
            </div>

          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 flex items-center gap-2">

            <Clock3 className="h-5 w-5 text-cyan-400" />

            <span className="font-bold">
              {time}
            </span>

          </div>

        </div>

      </header>

      {/* ANNOUNCE */}

      <section className="px-4 pt-5">

        <div
          className="
          relative
          overflow-hidden
          rounded-[30px]
          border
          border-cyan-400/20
          p-6
          bg-gradient-to-br
          from-cyan-500/20
          via-violet-500/20
          to-blue-500/20
        "
        >

          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />

          <div className="relative z-10">

            <div className="inline-flex items-center gap-2 rounded-full bg-black/30 px-3 py-1 text-xs border border-white/10">

              <Sparkles className="h-4 w-4 text-yellow-400" />

              Premium 24/7

            </div>

            <h2 className="mt-5 text-3xl font-black leading-tight">

              Faites exploser
              <span className="block text-cyan-400">
                votre audience
              </span>

            </h2>

            <p className="mt-4 text-sm text-gray-300 leading-relaxed">

              Likes • Followers • Vues • Réactions premium.
              Livraison rapide avec support WhatsApp instantané.

            </p>

            <div className="mt-6 flex gap-3">

              <Link
                to="/auth"
                className="
                flex-1
                rounded-2xl
                bg-cyan-400
                py-3
                text-center
                font-black
                text-black
              "
              >
                Commencer
              </Link>

              <Link
                to="/recharge"
                className="
                flex-1
                rounded-2xl
                border
                border-white/10
                bg-white/5
                py-3
                text-center
                font-bold
              "
              >
                Recharge
              </Link>

            </div>

          </div>

        </div>

      </section>

      {/* SERVICES */}

      <section className="px-4 pt-8">

        <div className="flex items-center justify-between">

          <div>

            <div className="text-xs uppercase text-gray-500">
              Choisissez
            </div>

            <h3 className="text-2xl font-black mt-1">
              Nos services
            </h3>

          </div>

          <div className="rounded-full bg-cyan-400/10 border border-cyan-400/20 px-4 py-2 text-xs font-bold text-cyan-400">

            Premium

          </div>

        </div>

        {/* TABS */}

        <div className="mt-5 grid grid-cols-3 gap-3">

          <button className="rounded-2xl bg-cyan-400 text-black py-4 font-black">
            Facebook
          </button>

          <button className="rounded-2xl bg-white/5 border border-white/10 py-4 font-bold text-gray-400">
            TikTok
          </button>

          <button className="rounded-2xl bg-white/5 border border-white/10 py-4 font-bold text-gray-400">
            Instagram
          </button>

        </div>

        {/* CARDS */}

        <div className="grid grid-cols-2 gap-4 mt-6 pb-24">

          {/* CARD */}

          <div className="rounded-[28px] border border-white/10 bg-[#111827] p-5">

            <div className="h-14 w-14 rounded-2xl bg-pink-500/20 flex items-center justify-center">

              <Flame className="h-7 w-7 text-pink-400" />

            </div>

            <h4 className="mt-5 text-xl font-black leading-tight">

              Boost Réaction

            </h4>

            <p className="mt-2 text-sm text-gray-400">

              Likes et réactions premium Facebook

            </p>

            <div className="mt-5 text-3xl font-black text-cyan-400">

              2 000 Ar

            </div>

            <div className="text-sm text-gray-500">

              /1000

            </div>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-green-500/10 border border-green-500/20 px-3 py-1 text-xs text-green-400">

              <ShieldCheck className="h-3 w-3" />

              Sécurisé

            </div>

          </div>

          {/* CARD */}

          <div className="rounded-[28px] border border-white/10 bg-[#111827] p-5">

            <div className="h-14 w-14 rounded-2xl bg-cyan-500/20 flex items-center justify-center">

              <Zap className="h-7 w-7 text-cyan-400" />

            </div>

            <h4 className="mt-5 text-xl font-black leading-tight">

              Followers TikTok

            </h4>

            <p className="mt-2 text-sm text-gray-400">

              Followers rapides haute qualité

            </p>

            <div className="mt-5 text-3xl font-black text-cyan-400">

              4 500 Ar

            </div>

            <div className="text-sm text-gray-500">

              /1000

            </div>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 text-xs text-cyan-400">

              FAST

            </div>

          </div>

        </div>

      </section>

      {/* FLOATING BUTTON */}

      <a
        href="https://wa.me/261347856539"
        target="_blank"
        className="
        fixed
        bottom-5
        right-5
        h-16
        w-16
        rounded-full
        bg-cyan-400
        text-black
        flex
        items-center
        justify-center
        shadow-[0_0_40px_rgba(0,255,255,0.5)]
      "
      >

        <MessageCircle className="h-8 w-8" />

      </a>

    </div>
  );
        }
