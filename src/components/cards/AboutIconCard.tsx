import Image from "next/image";

type AboutValuesProps = {
  src: string;
  subHeader: string;
  description: string;
};

export default function IconCard({
  src,
  subHeader,
  description,
}: AboutValuesProps) {
  return (
    <article className="flex h-full flex-col items-center px-5 py-8 text-center sm:px-6 sm:py-10">
      <div className="flex h-16 w-16 items-center justify-center">
        <Image
          src={src}
          alt=""
          width={64}
          height={64}
          aria-hidden="true"
          className="h-14 w-14 object-contain"
        />
      </div>

      <h3 className="mt-5 max-w-[180px] text-xs font-semibold uppercase leading-5 tracking-[0.18em] text-[#d6a64d]">
        {subHeader}
      </h3>

      <p className="mt-3 max-w-[230px] text-sm leading-6 text-[#faf7f2]/68">
        {description}
      </p>
    </article>
  );
}