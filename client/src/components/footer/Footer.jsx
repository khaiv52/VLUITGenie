function Footer() {
  return (
    <footer
      className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 text-[var(--text-color)]"
      style={{ marginBottom: "10px" }}
    >
      <div className="min-w-[200px]">
        <h3 className="mb-2 text-lg font-semibold">VLUITGenie</h3>
        <p>
          Chúng tôi phát triển dịch vụ và ứng dụng AI phục vụ công tác tuyển
          sinh của Trường Đại Học Văn Lang
        </p>
      </div>
      <div className="min-w-[200px]">
        <h3 className="mb-2 text-lg font-semibold">Địa chỉ</h3>
        <p>
          69/68 Đ. Đặng Thùy Trâm, Phường 13, Bình Thạnh, Hồ Chí Minh 70000,
          Vietnam
        </p>
      </div>
      <div className="min-w-[200px]">
        <h3 className="mb-2 text-lg font-semibold">Liên kết</h3>
        <a
          href="https://github.com/khaiv52/VLUITGenie/tree/side-branch"
          className="flex items-center gap-2"
        >
          <span className="text-blue-400 hover:text-blue-300">Github</span>
        </a>
      </div>
      <div className="min-w-[200px]">
        <h3 className="text-lg font-semibold" style={{ marginBottom: "8px" }}>
          Bản đồ
        </h3>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.7878689190507!2d106.69745087488317!3d10.827539589324344!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317528f4a62fce9b%3A0xc99902aa1e26ef02!2sVan%20Lang%20University%20-%20Main%20Campus!5e0!3m2!1sen!2s!4v1748154483806!5m2!1sen!2s"
          width="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="mt-2 w-full h-[200px] sm:h-[250px] md:h-[300px] lg:h-[400px]"
        ></iframe>
      </div>
    </footer>
  );
}

export default Footer;
