import { useCustomizer, type Panel } from "../store/customizer";
import {
  ProductIcon,
  ColorIcon,
  UploadIcon,
  PrintIcon,
  EffectsIcon,
  BuyIcon,
} from "./icons";

type ItemId = Exclude<Panel, null>;
const items: { id: ItemId; label: string; Icon: () => React.ReactElement }[] = [
  { id: "product", label: "Product", Icon: ProductIcon },
  { id: "color", label: "Color", Icon: ColorIcon },
  { id: "upload", label: "Upload", Icon: UploadIcon },
  { id: "print", label: "Print", Icon: PrintIcon },
  { id: "effects", label: "Effects", Icon: EffectsIcon },
  { id: "buy", label: "Buy", Icon: BuyIcon },
];

export function Toolbar() {
  const activePanel = useCustomizer((s) => s.activePanel);
  const openPanel = useCustomizer((s) => s.openPanel);

  return (
    <nav
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        background: "rgba(255,255,255,0.97)",
        borderTop: "1px solid rgba(0,0,0,0.06)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        padding: "10px 4px max(10px, env(safe-area-inset-bottom))",
        display: "flex",
        justifyContent: "space-around",
        zIndex: 10,
      }}
    >
      {items.map(({ id, label, Icon }) => {
        const active = activePanel === id;
        return (
          <button
            key={id}
            onClick={() => openPanel(active ? null : id)}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              minWidth: 52,
              padding: "6px 4px",
              color: active ? "#0f1115" : "#9ca3af",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: 0.2,
              transition: "color 0.15s",
            }}
          >
            <Icon />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
