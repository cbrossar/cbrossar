import unittest

from utils import edges


class TestEdges(unittest.TestCase):
    def test_american_to_prob(self):
        self.assertAlmostEqual(edges.american_to_prob(-110), 110 / 210)
        self.assertAlmostEqual(edges.american_to_prob(150), 0.4)
        self.assertAlmostEqual(edges.american_to_prob(100), 0.5)

    def test_american_to_decimal(self):
        self.assertAlmostEqual(edges.american_to_decimal(150), 2.5)
        self.assertAlmostEqual(edges.american_to_decimal(-200), 1.5)

    def test_devig_two_and_three_way(self):
        p = edges.american_to_prob(-110)
        self.assertEqual(edges.devig({"a": p, "b": p}), {"a": 0.5, "b": 0.5})
        three = edges.devig({"h": 0.5, "a": 0.3, "d": 0.3})
        self.assertAlmostEqual(sum(three.values()), 1)
        self.assertAlmostEqual(three["h"], 0.5 / 1.1)

    def test_kalshi_fee(self):
        # 0.07 * 100 * 0.5 * 0.5 = $1.75 for 100 contracts
        self.assertAlmostEqual(edges.kalshi_fee_per_contract(0.5), 0.0175)
        # one contract at 50c: 1.75c rounds up to 2c
        self.assertAlmostEqual(edges.kalshi_fee_per_contract(0.5, contracts=1), 0.02)
        # 0.07 * 100 * 0.1 * 0.9 = 63c exactly, no round-up
        self.assertAlmostEqual(edges.kalshi_fee_per_contract(0.1), 0.0063)

    def test_edges(self):
        self.assertAlmostEqual(edges.edge_a(0.5, 110), 0.05)
        self.assertAlmostEqual(edges.edge_b(0.55, 0.5, 0.0), 0.10)


if __name__ == "__main__":
    unittest.main()
