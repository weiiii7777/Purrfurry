#!/bin/bash

# 圖片壓縮腳本
cd dist

echo "開始壓縮圖片..."

# 壓縮 adopt 圖片
for file in adopt*.png adopt*.JPG; do
    if [ -f "$file" ]; then
        echo "壓縮 $file..."
        sips -Z 800 "$file" --out "${file%.*}_compressed.${file##*.}"
    fi
done

# 壓縮其他大圖片
for file in maomao.JPG juju.JPG wawa.jpg course-*.jpg; do
    if [ -f "$file" ]; then
        echo "壓縮 $file..."
        sips -Z 600 "$file" --out "${file%.*}_compressed.${file##*.}"
    fi
done

echo "壓縮完成！"
echo "檢查檔案大小："
ls -lah *_compressed.*
