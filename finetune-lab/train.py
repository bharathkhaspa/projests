"""Fine-tune DistilBERT to classify support tickets into 10 intents.

Runs on CPU in roughly 10-25 minutes (GPU: ~1 minute).
Usage:  python train.py
"""
import numpy as np
from transformers import (
    AutoModelForSequenceClassification,
    AutoTokenizer,
    Trainer,
    TrainingArguments,
)

from common import BASE_MODEL, MODEL_DIR, TARGET_INTENTS, load_split


def main() -> None:
    train_ds = load_split("train")
    test_ds = load_split("test")
    print(f"train: {len(train_ds)} examples · test: {len(test_ds)} examples · {len(TARGET_INTENTS)} intents")

    tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL)

    def tokenize(batch):
        return tokenizer(batch["text"], truncation=True, padding="max_length", max_length=64)

    train_ds = train_ds.map(tokenize, batched=True)
    test_ds = test_ds.map(tokenize, batched=True)

    model = AutoModelForSequenceClassification.from_pretrained(
        BASE_MODEL,
        num_labels=len(TARGET_INTENTS),
        id2label=dict(enumerate(TARGET_INTENTS)),
        label2id={t: i for i, t in enumerate(TARGET_INTENTS)},
    )

    def compute_metrics(pred):
        preds = np.argmax(pred.predictions, axis=1)
        return {"accuracy": float((preds == pred.label_ids).mean())}

    trainer = Trainer(
        model=model,
        args=TrainingArguments(
            output_dir="checkpoints",
            num_train_epochs=3,
            per_device_train_batch_size=16,
            learning_rate=3e-5,
            eval_strategy="epoch",
            save_strategy="no",
            logging_steps=25,
            report_to=[],
        ),
        train_dataset=train_ds,
        eval_dataset=test_ds,
        compute_metrics=compute_metrics,
    )

    trainer.train()
    metrics = trainer.evaluate()
    print(f"\nFinal test accuracy: {metrics['eval_accuracy']:.1%}")

    trainer.save_model(MODEL_DIR)
    tokenizer.save_pretrained(MODEL_DIR)
    print(f"Saved fine-tuned model to ./{MODEL_DIR}")


if __name__ == "__main__":
    main()
