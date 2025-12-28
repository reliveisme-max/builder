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

        return "
            <a href='{$link}' class='flex items-center gap-2 cursor-pointer group hover:opacity-80 transition' style='text-decoration: none; color: inherit;'>
                <div class='w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center group-hover:bg-gray-300 transition text-gray-600'>
                    <i class='ph ph-user text-lg'></i>
                </div>
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
                <div><label class="text-xs text-gray-400 block mb-1">Text dòng 1</label><input type="text" data-style="text_welcome" value="Xin chào!" class="prop-input w-full bg-gray-800 text-white p-2 rounded text-xs border border-gray-700"></div>
                <div><label class="text-xs text-gray-400 block mb-1">Text dòng 2</label><input type="text" data-style="text_action" value="Đăng nhập" class="prop-input w-full bg-gray-800 text-white p-2 rounded text-xs border border-gray-700"></div>
                <div><label class="text-xs text-gray-400 block mb-1">Link Login</label><input type="text" data-style="link_login" placeholder="/login" class="prop-input w-full bg-gray-800 text-white p-2 rounded text-xs border border-gray-700"></div>
            </div>
        ';
    }
}
