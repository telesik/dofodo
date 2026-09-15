// Растеризация SVG → PNG средствами macOS (AppKit/ImageIO), без сторонних
// зависимостей: ни ImageMagick, ни librsvg, ни браузера. Используется
// конвейером GIF «живой» партии (тикет 0037 штаба).
//
// Запуск: swift tools/svg-png.swift <вход.svg> <выход.png> [масштаб=2]

import AppKit

let args = CommandLine.arguments
guard args.count >= 3 else {
    FileHandle.standardError.write("Использование: svg-png.swift вход.svg выход.png [масштаб]\n".data(using: .utf8)!)
    exit(64)
}
let src = args[1]
let dst = args[2]
let scale = Double(args.count > 3 ? args[3] : "2") ?? 2

guard let img = NSImage(contentsOfFile: src) else {
    FileHandle.standardError.write("Не прочитал SVG: \(src)\n".data(using: .utf8)!)
    exit(65)
}
let w = Int((img.size.width * scale).rounded())
let h = Int((img.size.height * scale).rounded())
guard
    let rep = NSBitmapImageRep(
        bitmapDataPlanes: nil, pixelsWide: w, pixelsHigh: h, bitsPerSample: 8,
        samplesPerPixel: 4, hasAlpha: true, isPlanar: false,
        colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)
else { exit(70) }

NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
NSGraphicsContext.current?.imageInterpolation = .high
img.draw(in: NSRect(x: 0, y: 0, width: Double(w), height: Double(h)))
NSGraphicsContext.restoreGraphicsState()

guard let png = rep.representation(using: .png, properties: [:]) else { exit(71) }
try png.write(to: URL(fileURLWithPath: dst))
