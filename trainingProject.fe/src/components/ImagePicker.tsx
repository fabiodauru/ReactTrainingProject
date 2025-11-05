import { useState } from "react";

export type Image = {
  image: File;
  description: string;
  Date: string;
};

interface ImagePickerProps {
  images: Image[];
  setImages: React.Dispatch<React.SetStateAction<Image[]>>;
}

export default function ImagePicker({ images, setImages }: ImagePickerProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const addImage = (fileList: FileList | null) => {
    if (!fileList) return;

    const newFilesArray = Array.from(fileList);

    const newImageObjects = newFilesArray.map(
      (file) =>
        ({
          image: file,
          description: "",
          Date: new Date().toISOString(),
        } as Image)
    );

    setImages((prevImages) => [...prevImages, ...newImageObjects]);
  };

  const handleDeleteImage = () => {
    if (selectedIndex === null) return;

    setImages((prevImages) => prevImages.filter((_, i) => i !== selectedIndex));
    setSelectedIndex(null);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDescription = e.target.value;

    setImages((prevImages) =>
      prevImages.map((img, i) => {
        if (i === selectedIndex) {
          return { ...img, description: newDescription };
        }
        return img;
      })
    );
  };

  return (
    <div className="flex flex-col flex-1 min-w-xs bg-[color:var(--color-primary)] p-6 rounded-2xl shadow-lg border border-[color:var(--color-muted)]">
      <div>
        <label className="text-sm font-medium text-[color:var(--color-foreground)] mb-2 block">
          Add Images
        </label>
        <input
          type="file"
          multiple
          accept="image/*"
          className="w-full bg-[color:color-mix(in srgb,var(--color-muted) 30%,transparent)] text-[color:var(--color-foreground)] p-2 rounded-lg"
          onChange={(e) => addImage(e.target.files)}
        />
      </div>

      <div className="flex-1 overflow-y-auto mt-6 pr-2 max-h-62 no-scrollbar">
        <div className="flex flex-wrap gap-4 p-2">
          {images.map((file, index) => (
            <div
              key={index}
              className={`relative group w-27 h-27 overflow-hidden rounded-xl cursor-pointer transition-transform duration-200 ${
                selectedIndex === index
                  ? "ring-4 ring-[color:var(--color-accent)] scale-105"
                  : "hover:ring-2 hover:ring-[color:var(--color-accent)] hover:scale-105"
              }`}
              onClick={() => setSelectedIndex(index)}
            >
              <img
                src={URL.createObjectURL(file.image)}
                alt={`Trip Image ${index}`}
                className="object-cover w-full h-full rounded-xl"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-[color:var(--color-muted)]">
        {selectedIndex !== null && (
          <div className="p-4 mb-4 bg-[color:color-mix(in srgb,var(--color-muted) 30%,transparent)] border border-[color:var(--color-muted)] rounded-xl">
            <h3 className="text-sm font-medium text-[color:var(--color-foreground)] mb-2">
              Add image description
            </h3>
            <input
              type="text"
              className="w-full bg-[color:var(--color-background)] text-[color:var(--color-foreground)] p-2 rounded-lg focus:ring-2 focus:ring-[color:var(--color-accent)] focus:outline-none mb-3"
              placeholder="Add image description..."
              value={images[selectedIndex]?.description || ""}
              onChange={handleDescriptionChange}
            />
            <button
              className="w-full bg-[color:var(--color-error)] hover:bg-[color:color-mix(in srgb,var(--color-error) 90%,black)] text-white py-2 rounded-lg transition-colors duration-200 font-medium"
              onClick={handleDeleteImage}
            >
              Delete Image
            </button>
          </div>
        )}

        {selectedIndex === null && images.length > 0 && (
          <b className="block mb-4 text-[color:var(--color-muted-foreground)] text-center">
            Select an image to add a description or delete it.
          </b>
        )}
      </div>
    </div>
  );
}
