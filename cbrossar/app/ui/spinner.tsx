import styles from "./spinner.module.css";

export default function Spinner() {
    return (
        <div className="flex justify-center h-screen">
            <div className={styles.spinner}></div>
        </div>
    );
}
