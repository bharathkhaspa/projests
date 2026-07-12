from django import template

register = template.Library()

# India bounding box for projecting lat/lng into the 600x460 SVG canvas.
_BOUNDS = {"min_lng": 68.0, "max_lng": 90.0, "min_lat": 8.0, "max_lat": 34.0}
_W, _H = 600, 460


def _project(lat, lng):
    x = (lng - _BOUNDS["min_lng"]) / (_BOUNDS["max_lng"] - _BOUNDS["min_lng"]) * _W
    y = _H - (lat - _BOUNDS["min_lat"]) / (_BOUNDS["max_lat"] - _BOUNDS["min_lat"]) * _H
    return round(x, 1), round(y, 1)


@register.inclusion_tag("partials/route_map.html")
def route_map(origin_lat, origin_lng, dest_lat, dest_lng, current_lat=None, current_lng=None,
              origin_label="", dest_label="", live=False, height=320):
    ox, oy = _project(float(origin_lat), float(origin_lng))
    dx, dy = _project(float(dest_lat), float(dest_lng))
    cx_ctrl = (ox + dx) / 2
    cy_ctrl = (oy + dy) / 2 - 50
    has_current = current_lat not in (None, "") and current_lng not in (None, "")
    ctx = {
        "W": _W, "H": _H, "height": height,
        "ox": ox, "oy": oy, "dx": dx, "dy": dy,
        "ctrl_x": round(cx_ctrl, 1), "ctrl_y": round(cy_ctrl, 1),
        "origin_label": origin_label, "dest_label": dest_label, "live": bool(live),
        "has_current": has_current,
    }
    if has_current:
        cx, cy = _project(float(current_lat), float(current_lng))
        ctx["cx"], ctx["cy"] = cx, cy
        ctx["cx_pct"] = round(cx / _W * 100, 2)
        ctx["cy_pct"] = round(cy / _H * 100, 2)
    return ctx


@register.simple_tag
def status_class(status):
    return f"s-{status}"
