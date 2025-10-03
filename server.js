import fetch from "node-fetch";
import express from "express";

const app = express();
const PORT = process.env.PORT || 5000;

const url = "https://app-tai-xiu-default-rtdb.firebaseio.com/taixiu_sessions.json";

let latestPhien = null;

async function getLatestSession() {
  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data) {
      // Lọc bỏ những record không có "Phien"
      const sessions = Object.values(data).filter(x => x.Phien !== undefined);

      if (sessions.length > 0) {
        // Tìm phiên lớn nhất
        const latestSession = sessions.reduce((a, b) =>
          a.Phien > b.Phien ? a : b
        );

        if (latestPhien === null || latestSession.Phien > latestPhien) {
          latestPhien = latestSession.Phien;

          // Tính tổng xúc xắc
          const sum = latestSession.xuc_xac_1 + latestSession.xuc_xac_2 + latestSession.xuc_xac_3;

          // Tính dự đoán (giả sử bạn đã có logic dự đoán ở đâu đó)
          const duDoan = sum >= 11 ? "Tài" : "Xỉu"; // ví dụ dự đoán đơn giản

          return {
            id: "ĐỘC QUYỀN CỦA @cha tao",
            Phien: latestSession.Phien,
            Xuc_xac1: latestSession.xuc_xac_1,
            Xuc_xac2: latestSession.xuc_xac_2,
            Xuc_xac3: latestSession.xuc_xac_3,
            Tổng: sum,
            Phien_du_doan: latestSession.Phien + 1,
            Du_doan: duDoan
          };
        }
      }
    }
  } catch (err) {
    console.error("Lỗi:", err.message);
  }
  return null;
}

// API trả về JSON theo định dạng dọc
app.get("/api/68/taixiu", async (req, res) => {
  const latest = await getLatestSession();
  if (latest) {
    res.json(latest);
  } else {
    res.status(404).json({ error: "Không có phiên mới" });
  }
});

// Kiểm tra mỗi 3 giây để update latestPhien
setInterval(getLatestSession, 3000);

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
