<?php

namespace Modules\Header\Elements;

use Core\Block;

class Account extends Block
{
    public function getInfo()
    {
        return ['name' => 'Account / User', 'icon' => 'ph-user', 'group' => 'E-commerce'];
    }

    public function render($settings = [])
    {
        $welcome = $settings['text_welcome'] ?? 'Xin chào!';
        $action = $settings['text_action'] ?? 'Đăng nhập';
        $link = $settings['link_login'] ?? '/login';
        $showIcon = $settings['show_icon'] ?? 'true';

        $iconHtml = '';
        if ($showIcon !== 'false') {
            $iconHtml = "<div class='w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center group-hover:bg-gray-300 transition text-gray-600'>
                            <i class='ph ph-user text-lg'></i>
                         </div>";
        }

        return "
            <a href='{$link}' class='flex items-center gap-2 cursor-pointer group hover:opacity-80 transition' style='text-decoration: none; color: inherit;'>
                {$iconHtml}
                <div class='flex flex-col leading-tight'>
                    <span class='text-[10px] opacity-70 inner-text-welcome'>{$welcome}</span>
                    <span class='text-xs font-bold inner-text-action'>{$action}</span>
                </div>
            </a>
        ";
    }

    public function getForm()
    {
        return '
            <div class="space-y-3">
                <div class="flex items-center justify-between bg-gray-800 p-2 rounded border border-gray-700">
                    <label class="text-xs text-gray-300">Hiện Icon User</label>
                    <input type="checkbox" data-style="show_icon" checked class="w-4 h-4 rounded bg-gray-700 border-gray-600 accent-indigo-500 cursor-pointer">
                </div>
                <div class="grid grid-cols-2 gap-2">
                    <div><label class="text-xs text-gray-400 block mb-1">Dòng 1</label><input type="text" data-style="text_welcome" value="Xin chào!" class="prop-input w-full bg-gray-800 text-white p-2 rounded text-xs border border-gray-700"></div>
                    <div><label class="text-xs text-gray-400 block mb-1">Dòng 2</label><input type="text" data-style="text_action" value="Đăng nhập" class="prop-input w-full bg-gray-800 text-white p-2 rounded text-xs border border-gray-700"></div>
                </div>
                <div><label class="text-xs text-gray-400 block mb-1">Link Login</label><input type="text" data-style="link_login" placeholder="/login" class="prop-input w-full bg-gray-800 text-white p-2 rounded text-xs border border-gray-700"></div>
                
                <hr class="border-gray-800">
                <label class="text-[10px] font-bold text-gray-500 uppercase mb-2 block">HIỂN THỊ TRÊN</label>
                <div class="flex flex-col gap-2">
                    <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" data-style="hide_desktop" class="w-4 h-4 rounded bg-gray-700 border-gray-600 accent-red-500"><span class="text-xs text-gray-400">Ẩn Desktop (>1024px)</span></label>
                    <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" data-style="hide_tablet" class="w-4 h-4 rounded bg-gray-700 border-gray-600 accent-red-500"><span class="text-xs text-gray-400">Ẩn Tablet (768-1024px)</span></label>
                    <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" data-style="hide_mobile" class="w-4 h-4 rounded bg-gray-700 border-gray-600 accent-red-500"><span class="text-xs text-gray-400">Ẩn Mobile (<768px)</span></label>
                </div>
            </div>
        ';
    }
}
