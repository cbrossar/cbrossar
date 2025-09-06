import Image from "next/image";

export default async function Page() {
    return (
        <div>
            <h1>Hello, World!</h1>
            <Image src="https://coverartarchive.org/release/23ed446f-c436-4bd1-9ac1-af5f68226217/42723200377.jpg" alt="Hello" width={100} height={100} />
        </div>
    );
}
