import Masonry from "react-responsive-masonry";

export function ProductGallery() {
  const galleryImages = [
    {
      url: "https://images.unsplash.com/photo-1701191579013-7013090c370e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkcmllZCUyMGNsb3ZlcyUyMHNwaWNlfGVufDF8fHx8MTc4MTg2MzM5M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      title: "Premium Cloves",
    },
    {
      url: "https://images.unsplash.com/photo-1765118527220-da9c7a560b13?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxudXRtZWclMjBzcGljZSUyMHdob2xlfGVufDF8fHx8MTc4MTg2MzM4Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      title: "Nutmeg",
    },
    {
      url: "https://images.unsplash.com/flagged/photo-1553617569-8ef7a8da3146?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxleG90aWMlMjBzcGljZXMlMjBtYXJrZXR8ZW58MXx8fHwxNzgxODYzMzkwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      title: "Spice Market",
    },
    {
      url: "https://images.unsplash.com/photo-1591801058986-9e28e68670f7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMHBlcHBlciUyMHBlcHBlcmNvcm5zfGVufDF8fHx8MTc4MTg2MzM4Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      title: "Black Pepper",
    },
    {
      url: "/Cinnamon.jpg",
      title: "Cinnamon Sticks",
    },
    {
      url: "https://images.unsplash.com/photo-1707219622063-729d6379d436?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRvbmVzaWFuJTIwc3BpY2VzJTIwbHV4dXJ5fGVufDF8fHx8MTc4MTg2MzM4OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      title: "Indonesian Spices",
    },
    {
      url: "https://images.unsplash.com/photo-1606951444141-e5533feb55be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0dXJtZXJpYyUyMHBvd2RlciUyMHNwaWNlfGVufDF8fHx8MTc4MTg2MzM4OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      title: "Turmeric Powder",
    },
    {
      url: "https://images.unsplash.com/photo-1521706862577-47b053587f91?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGljZSUyMHBsYW50YXRpb24lMjB0cm9waWNhbHxlbnwxfHx8fDE3ODE4NjMzODl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      title: "Spice Plantation",
    },
    {
      url: "https://images.unsplash.com/photo-1642255521852-7e7c742ac58f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJkYW1vbSUyMGdyZWVuJTIwcG9kc3xlbnwxfHx8fDE3ODE4NjMzODd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      title: "Cardamom",
    },
  ];

  return (
    <section className="py-24 bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="w-16 h-1 bg-[#B8956A] mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0A0A0A] mb-4">
            Product Gallery
          </h2>
          <p className="text-lg text-[#717171] max-w-3xl mx-auto leading-relaxed">
            A visual showcase of our premium Indonesian commodities and sourcing capabilities.
          </p>
        </div>

        {/* Masonry Gallery */}
        <Masonry columnsCount={3} gutter="1rem">
          {galleryImages.map((image, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-lg cursor-pointer"
            >
              <img
                src={image.url}
                alt={image.title}
                className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-500"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="w-12 h-1 bg-[#B8956A] mb-3" />
                  <h3 className="text-white font-semibold text-lg">{image.title}</h3>
                </div>
              </div>
            </div>
          ))}
        </Masonry>

        {/* Trust badge */}
        <div className="mt-16 text-center">
          <p className="text-sm text-[#717171] uppercase tracking-wider mb-3">Trusted By</p>
          <p className="text-2xl font-semibold text-[#0A0A0A]">
            International Importers & Distributors Worldwide
          </p>
        </div>
      </div>
    </section>
  );
}
