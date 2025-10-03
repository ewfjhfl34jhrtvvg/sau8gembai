import express from "express";

const app = express();
const PORT = process.env.PORT || 5000;

// URL Firebase Realtime Database
const url = "https://app-tai-xiu-default-rtdb.firebaseio.com/taixiu_sessions.json";

let latestPhien = null;

// Hàm lấy phiên mới nhất từ Firebase
async function getLatestSession() {
  try {
    const res = await fetch(url); // Node 18+ có fetch sẵn
    const data = await res.json();

    if (data) {
      // Lọc các record có Phien
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

          // Dự đoán đơn giản Tài/Xỉu
          const duDoan = sum >= 11 ? "Tài" : "Xỉu";

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
    console.error("Lỗi khi fetch Firebase:", err.message);
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

// Kiểm tra mỗi 3 giây để cập nhật latestPhien
setInterval(getLatestSession, 3000);

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
