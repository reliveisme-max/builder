<?php

namespace Core;

abstract class Block
{
    // Thông tin hiển thị trên Sidebar (Icon, Tên)
    abstract public function getInfo();

    // HTML hiển thị trên Canvas
    abstract public function render($settings = []);

    // HTML form cài đặt bên phải (Properties)
    public function getForm()
    {
        return '<div class="text-gray-500 text-xs">Không có cài đặt</div>';
    }
}
