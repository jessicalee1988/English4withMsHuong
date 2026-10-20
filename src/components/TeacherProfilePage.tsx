/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import msHuongPortrait from '../assets/ms_huong.jpg';
import {
  ArrowLeft,
  BookOpen,
  GraduationCap,
  Heart,
  Mail,
  MapPin,
  Phone,
  School,
  Sparkles,
  User,
} from 'lucide-react';

interface Props {
  onBackToHome: () => void;
  onStartLearning: () => void;
}

export const TeacherProfilePage: React.FC<Props> = ({
  onBackToHome,
  onStartLearning,
}) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-sm border border-slate-200/90 shadow-2xs transition-colors cursor-pointer touch-manipulation"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          <span>Về trang chủ (Home)</span>
        </button>

        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-sky-100 text-sky-800 text-xs font-bold border border-sky-200">
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          <span>Giáo viên Tiếng Anh lớp 4</span>
        </span>
      </div>

      {/* Main Profile Showcase Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md overflow-hidden">
        {/* Decorative Header Banner */}
        <div className="bg-gradient-to-r from-sky-500 via-sky-600 to-teal-500 px-6 sm:px-10 py-8 text-white relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-sky-100 text-xs font-bold uppercase tracking-wider">
              Profile • Thông tin giáo viên
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
              Meet Ms Huong – Giới thiệu cô Hường
            </h1>
            <p className="text-sky-100 text-sm sm:text-base font-medium">
              Giáo viên phụ trách chương trình Tiếng Anh 4 Global Success
            </p>
          </div>
        </div>

        {/* Content Section: Portrait on Left/Top, Details on Right */}
        <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Portrait Image Container */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-lg border-4 border-white ring-2 ring-sky-100 bg-white group flex flex-col items-center">
              <div className="w-full bg-white flex items-center justify-center p-3 sm:p-4">
                <img
                  src={msHuongPortrait}
                  alt="Cô Nguyễn Thị Hường - Giáo viên Tiếng Anh Trường Tiểu học Hải An"
                  className="w-full h-auto max-h-[460px] object-contain rounded-2xl transition-transform duration-500 group-hover:scale-102"
                  loading="eager"
                />
              </div>
              <div className="w-full bg-gradient-to-r from-sky-50 to-teal-50 border-t border-sky-100 py-3.5 px-4 text-center">
                <p className="text-base sm:text-lg font-extrabold text-slate-900">Cô Nguyễn Thị Hường</p>
                <p className="text-xs text-sky-700 font-bold mt-0.5">Trường Tiểu học Hải An • Ninh Bình</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2.5 italic text-center">
              Chân dung cô giáo Nguyễn Thị Hường (Ảnh đại diện chính thức)
            </p>
          </div>

          {/* Teacher Biography & Information */}
          <div className="lg:col-span-7 space-y-6">
            {/* Identity & Role */}
            <div className="space-y-1.5 border-b border-slate-100 pb-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                <span>Primary School English Teacher • Giáo viên Tiếng Anh Tiểu học</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                Nguyễn Thị Hường
              </h2>
              <p className="text-base sm:text-lg font-bold text-sky-600">
                Ms Huong – Cô Hường
              </p>
            </div>

            {/* School & Contact Information Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* School Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <School className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>Trường học (School)</span>
                </div>
                <p className="font-extrabold text-slate-900 text-sm sm:text-base">
                  Trường Tiểu học Hải An
                </p>
              </div>

              {/* School Address Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Địa chỉ (Address)</span>
                </div>
                <p className="font-bold text-slate-800 text-sm sm:text-base">
                  Xã Hải An, tỉnh Ninh Bình
                </p>
              </div>

              {/* Phone Card */}
              <a
                href="tel:0399789234"
                className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 hover:border-sky-400 hover:bg-sky-100/70 transition-all group cursor-pointer space-y-1.5 touch-manipulation"
                title="Gọi điện cho cô Hường / Call Ms Huong"
              >
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-700">
                  <Phone className="w-4 h-4 text-sky-600 shrink-0 group-hover:scale-110 transition-transform" />
                  <span>Số điện thoại (Phone)</span>
                </div>
                <p className="font-black text-sky-900 text-base sm:text-lg group-hover:underline">
                  0399789234
                </p>
                <span className="text-[11px] text-sky-600 font-semibold block">
                  Bấm để gọi điện ➔
                </span>
              </a>

              {/* Email Card */}
              <a
                href="mailto:nguyenhuonghahhnd@gmail.com"
                className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 hover:border-teal-400 hover:bg-teal-100/70 transition-all group cursor-pointer space-y-1.5 touch-manipulation"
                title="Gửi email cho cô Hường / Email Ms Huong"
              >
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700">
                  <Mail className="w-4 h-4 text-teal-600 shrink-0 group-hover:scale-110 transition-transform" />
                  <span>Email liên hệ</span>
                </div>
                <p className="font-extrabold text-teal-950 text-xs sm:text-sm break-all group-hover:underline">
                  nguyenhuonghahhnd@gmail.com
                </p>
                <span className="text-[11px] text-teal-700 font-semibold block">
                  Bấm để gửi email ➔
                </span>
              </a>
            </div>

            {/* Bilingual Welcome Message for Grade 4 Students */}
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-amber-50/90 via-sky-50/60 to-emerald-50/80 border border-amber-200/80 space-y-3.5">
              <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm sm:text-base">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500 shrink-0" />
                <span>Lời nhắn gửi từ cô Hường • Message from Ms Huong</span>
              </div>

              {/* Vietnamese Message */}
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Tiếng Việt:
                </p>
                <p className="text-slate-800 text-sm sm:text-base leading-relaxed font-medium">
                  "Chào các em học sinh lớp 4 thân yêu! Chào mừng các em đến với trang học Tiếng Anh 4 cùng cô Hường. Chúng ta sẽ cùng nhau khám phá kho từ vựng sinh động, nắm vững các mẫu câu trọng tâm và thực hành các bài tập bổ ích để ngày càng tự tin hơn với môn Tiếng Anh nhé!"
                </p>
              </div>

              {/* English Message */}
              <div className="space-y-1 pt-2 border-t border-amber-200/60">
                <p className="text-xs font-bold uppercase tracking-wider text-sky-800">
                  English:
                </p>
                <p className="text-slate-700 text-sm sm:text-base leading-relaxed font-normal italic">
                  "Hello dear 4th graders! Welcome to English 4 with Ms Huong. Together, we explore exciting vocabulary, master key sentence patterns, and practice fun exercises to build your confidence in English every single day. Let's enjoy learning together!"
                </p>
              </div>
            </div>

            {/* Call to Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onStartLearning}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-extrabold text-sm sm:text-base shadow-md transition-all hover:scale-102 cursor-pointer touch-manipulation"
              >
                <BookOpen className="w-5 h-5" />
                <span>Học bài ngay (Start Learning)</span>
              </button>

              <button
                type="button"
                onClick={onBackToHome}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all cursor-pointer touch-manipulation"
              >
                <span>Về trang chủ</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
